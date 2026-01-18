package com.exercise.engine

import com.exercise.model._
import com.exercise.utils.SolrConnector
import org.apache.spark.sql.SparkSession

class CohortSearchEngine(solrUrl: String) {

  // Initialisation de la Spark Session
  val spark: SparkSession = SparkSession.builder()
    .appName("CohortSearchEngine")
    .master("local[*]")
    .getOrCreate()

  import spark.implicits._

  private val connector = new SolrConnector(spark, solrUrl)

  def runSearch(criteria: SearchCriteria): Long = {
    /*
     * ============================================================
     *  CONSIGNE CANDIDAT — Implémentation du coeur du moteur ici
     * ============================================================
     *
     * Objectif :
     *   Cette méthode doit exécuter une requête de "cohorte" à partir d'un ensemble
     *   de critères (SearchCriteria) et retourner le NOMBRE de patients correspondant.
     *
     *   L'implémentation attendue doit respecter les règles de gestion
     *   décrites dans le README du projet (chargement dynamique, load Solr,
     *   inclusion/exclusion, jointures).
     *
     * Contraintes et attendus (à respecter) :
     *
     * 1) Chargement dynamique des critères
     *   - Parcourir la liste des critères (Criteria) reçus dans le SearchCriteria.
     *   - Chaque critère indique une Resource (ex: "Patient", "Encounter", "DocumentReference"...).
     *   - Cette Resource doit être mappée à la collection Solr correspondante (ex: patientAphp, encounterAphp, ...).
     *   - Le moteur NE DOIT PAS être codé "en dur" pour un seul cas : il doit fonctionner
     *     quel que soit le nombre de critères et l'ordre des critères.
     *
     * 2) Filtrage Solr
     *   - Les searchParams sont exprimés dans un format FHIR simplifié.
     *   - Vous devez traduire ces paramètres en filtres Solr
     *
     * * 3) Logique Inclusion / Exclusion
     *   - Chaque critère a un flag Include (string "true"/"false").
     *   Si valeur "true" :
     *     - Conserver les patients qui possèdent AU MOINS une ressource correspondant au critère.
     *   Sinon:
     *     - Exclure les patients qui possèdent AU MOINS une ressource correspondant au critère.
     *    Lorsque plusieurs critères sont présents, la cohorte finale doit
     *       correspondre à l'INTERSECTION de ces patients satisfaisant chaque critère d'inclusion ou exclusion.
     * 4) Jointures (règle de rattachement des ressources au Patient)
     *     - Les critères sont liés par id patient
     *
     * Résultat attendu :
     *   - Retourner un Long correspondant au nombre de patients distinct.
     *
     * Important :
     *   - Le code doit rester lisible et testable.
     *   - Toute hypothèse métier doit être cohérente avec les règles du README.
     */
    
    // 1 Map des resources -> collections Solr
    val resourceToCollection = Map(
      "Patient" -> "patientAphp",
      "Encounter" -> "encounterAphp",
      "DocumentReference" -> "documentReferenceAphp",
      "Organization" -> "organizationAphp"
    )

    // 2 DataFrame initial des patients : vide
    var finalPatients: Option[Dataset[String]] = None
    }

    // 3 Parcours de chaque critère
    criteria.Criteria.foreach { crit =>
      val collectionName = resourceToCollection.getOrElse(crit.Resource,
        throw new RuntimeException(s"Unknown resource: ${crit.Resource}"))

      // Conversion des searchParams FHIR -> filtres Solr
      val filters = crit.searchParams.split("&").map { param =>
        val Array(key, value) = param.split("=", 2)
        key match {
          case "birthDate" if value.startsWith("ge") =>
            val v = value.stripPrefix("ge")
            s"$key:[$v" + "T00:00:00Z TO *]"
          case "birthDate" if value.startsWith("le") =>
            val v = value.stripPrefix("le")
            s"$key:[* TO $v" + "T23:59:59Z]"
          case "length" if value.startsWith("lt") =>
            val v = value.stripPrefix("lt")
            s"$key:[* TO ${v.toInt - 1}]"
          case "length" if value.startsWith("gt") =>
            val v = value.stripPrefix("gt")
            s"$key:[${v.toInt + 1} TO *]"
          case "gender" | "active" | "description" =>
            s"$key:${value}"
          case _ =>
            throw new RuntimeException(s"Unsupported search param: $param")
        }
      }.toSeq

      // Load la collection via SolrConnector
      val df = connector.loadCollection(collectionName, filters)

      // Extraction des patientIds (ou "subject" selon le schema Solr)
      val patientIds = crit.Resource match {
        case "Patient" =>
          df.select($"id".as[String]).distinct()
        case _ =>
          // toutes les ressources liées au patient ont une colonne patientId
          df.select($"patientId".as[String]).distinct()
      }

      // Inclusion / exclusion
      crit.Include.toLowerCase match {
        case "true" =>
          finalPatients = finalPatients match {
            case Some(fp) => Some(fp.intersect(patientIds))
            case None     => Some(patientIds)
          }
        case "false" =>
          finalPatients = finalPatients match {
            case Some(fp) => Some(fp.except(patientIds))
            case None     =>
              // Si aucun patient de base, on prend tous les patients et exclut ceux-ci
              val allPatients = connector.loadCollection("patientAphp")
                .select($"id".as[String])
                .distinct()
              Some(allPatients.except(patientIds))
          }
        case other =>
          throw new RuntimeException(s"Invalid Include value: $other")
      }

    // 4 Gestion des périmètres (Ex: Organization / Encounter)
    if (criteria.Perimeters.nonEmpty) {
      val encounters = connector.loadCollection("encounterAphp")
        .filter($"organizationId".isin(criteria.Perimeters: _*))
        .select($"patientId".as[String])
        .distinct()

      finalPatients = finalPatients match {
        case Some(fp) => Some(fp.intersect(encounters))
        case None     => Some(encounters)
      }
    }

    // 5 Résultat : nombre de patients distinct
    finalPatients.map(_.count()).getOrElse(0L)
  }

  def stop(): Unit = spark.stop()
}
