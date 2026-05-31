-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:8889
-- Généré le : dim. 31 mai 2026 à 09:55
-- Version du serveur : 8.0.40
-- Version de PHP : 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `gestion_absences`
--

-- --------------------------------------------------------

--
-- Structure de la table `absences`
--

CREATE TABLE `absences` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `session_id` int NOT NULL,
  `is_absent` tinyint(1) DEFAULT '0',
  `delay_minutes` int DEFAULT '0' COMMENT '0 = pas de retard',
  `is_justified` tinyint(1) DEFAULT '0',
  `justification` text COLLATE utf8mb4_unicode_ci,
  `justification_file` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `recorded_by` int NOT NULL COMMENT 'user_id du prof',
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `campuses`
--

CREATE TABLE `campuses` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `campuses`
--

INSERT INTO `campuses` (`id`, `name`, `city`, `created_at`) VALUES
(1, 'HEM Engineering School', 'Casablanca', '2026-05-20 17:12:17'),
(2, 'HEM Business School', 'Casablanca', '2026-05-20 17:12:17'),
(3, 'HEM Business School', 'Rabat', '2026-05-20 17:12:17'),
(4, 'HEM Business School', 'Marrakech', '2026-05-20 17:12:17'),
(5, 'HEM Business School', 'Tanger', '2026-05-20 17:12:17');

-- --------------------------------------------------------

--
-- Structure de la table `filieres`
--

CREATE TABLE `filieres` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `campus_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `filieres`
--

INSERT INTO `filieres` (`id`, `name`, `code`, `campus_id`) VALUES
(1, 'Engineering School Semestre 4', 'ES-S4', 1),
(2, 'Business School Semestre 2', 'BS-S2', 2),
(4, 'Engineering School Semestre 1', 'ES-S1', 1);

-- --------------------------------------------------------

--
-- Structure de la table `groups`
--

CREATE TABLE `groups` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filiere_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `groups`
--

INSERT INTO `groups` (`id`, `name`, `filiere_id`, `created_at`) VALUES
(3, 'ES 4', 1, '2026-05-31 00:18:15');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` int NOT NULL,
  `subject_id` int NOT NULL,
  `professor_id` int NOT NULL,
  `filiere_id` int NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `is_call_done` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `group_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `students`
--

CREATE TABLE `students` (
  `id` int NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `code_apogee` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `filiere_id` int NOT NULL,
  `campus_id` int NOT NULL,
  `photo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `group_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `students`
--

INSERT INTO `students` (`id`, `first_name`, `last_name`, `email`, `code_apogee`, `filiere_id`, `campus_id`, `photo`, `is_active`, `created_at`, `group_id`) VALUES
(18, 'Youssef', 'El Amrani', 'y.elamrani@hem.ac.ma', '20240001', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(19, 'Imane', 'Essaidi', 'i.essaidi@hem.ac.ma', '20240002', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(20, 'Karim', 'Benali', 'k.benali@hem.ac.ma', '20240003', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(21, 'Sara', 'Tazi', 's.tazi@hem.ac.ma', '20240004', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(22, 'Mohammed', 'Alaoui', 'm.alaoui@hem.ac.ma', '20240005', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(23, 'Fatima', 'Chraibi', 'f.chraibi@hem.ac.ma', '20240006', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(24, 'Omar', 'Idrissi', 'o.idrissi@hem.ac.ma', '20240007', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(25, 'Nadia', 'Benkirane', 'n.benkirane@hem.ac.ma', '20240008', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(26, 'Amine', 'Fassi', 'a.fassi@hem.ac.ma', '20240009', 1, 1, NULL, 0, '2026-05-30 22:27:57', NULL),
(27, 'Zineb', 'Kettani', 'z.kettani@hem.ac.ma', '20240010', 1, 1, NULL, 1, '2026-05-30 22:27:57', NULL),
(30, 'aya', 'ezzaytouny', 'AYA@GMAIL.COM', '1', 1, 1, NULL, 1, '2026-05-31 09:42:48', 3);

-- --------------------------------------------------------

--
-- Structure de la table `student_states`
--

CREATE TABLE `student_states` (
  `id` int NOT NULL,
  `student_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `absence_count` int DEFAULT '0',
  `total_absence_hours` decimal(5,2) DEFAULT '0.00',
  `state` enum('normal','warning_1','warning_2','failed','redoublant') COLLATE utf8mb4_unicode_ci DEFAULT 'normal',
  `participation_note` decimal(4,2) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `subjects`
--

CREATE TABLE `subjects` (
  `id` int NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `volume_horaire` int NOT NULL COMMENT 'en heures',
  `credits` int DEFAULT '3',
  `filiere_id` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `subjects`
--

INSERT INTO `subjects` (`id`, `name`, `code`, `volume_horaire`, `credits`, `filiere_id`) VALUES
(1, 'Langues 2 : Français', 'L2-FR', 15, 1, 1),
(2, 'Langues 2 : Anglais', 'L2-EN', 30, 2, 1),
(3, 'Recherche Opérationnelle & Théorie décision', 'RO-TD', 45, 3, 1),
(4, 'Droit Appliqué à l\'informatique', 'DAI', 30, 2, 1),
(5, 'Programmation Web', 'PWEB', 30, 2, 1),
(6, 'Administration BD : Oracle', 'ABD', 45, 3, 1),
(7, 'Développement Mobile', 'DMOB', 45, 3, 1),
(8, 'Macro Economie', 'MECO', 36, 3, 2),
(9, 'Techniques Quantitatives 2', 'TQ2', 36, 3, 2),
(10, 'Informatique de Gestion', 'IG', 36, 3, 2),
(11, 'Comptabilité d\'Entreprise 2', 'CE2', 36, 3, 2),
(12, 'Expression française', 'EXFR', 36, 3, 2),
(13, 'Expression Anglaise', 'EXEN', 36, 3, 2),
(14, 'Séminaires Développement personnel 1', 'SDP1', 18, 1, 2),
(15, 'Algorithmique', 'alg1', 30, 2, 4),
(21, 'Management', 'MGT101', 40, 3, 2),
(22, 'Marketing', 'MKT201', 35, 3, 2),
(23, 'Comptabilité', 'CPT101', 45, 4, 2),
(24, 'Finance', 'FIN301', 40, 3, 2),
(25, 'Économie', 'ECO101', 30, 2, 2),
(26, 'Génie logiciel', 'GEN401', 45, 3, 1),
(27, 'Intelligence artificielle', 'IA401', 50, 4, 1),
(28, 'Systèmes d\'exploitation', 'SYS301', 40, 3, 1),
(29, 'Sécurité informatique', 'SEC401', 35, 2, 1),
(30, 'Structures de données', 'STR201', 45, 3, 1);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `first_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'bcrypt hash',
  `role` enum('admin','professor','assistant','responsable') COLLATE utf8mb4_unicode_ci NOT NULL,
  `campus_id` int DEFAULT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `token_expires_at` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `campus_id`, `token`, `token_expires_at`, `is_active`, `created_at`) VALUES
(8, 'Admin', 'HEM', 'admin@hem.ac.ma', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, NULL, NULL, 1, '2026-05-22 18:13:45'),
(10, 'prof', '1', 'prof1@hem.ac.ma', '$2y$10$WRb0MYYnMcbyrtnojcT5F.Zgst6nDukYTMt01FZcv5d0SE2LXvRdy', 'professor', NULL, NULL, NULL, 1, '2026-05-30 23:03:14');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_absence_summary`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_absence_summary` (
`student_id` int
,`student_name` varchar(201)
,`subject_name` varchar(150)
,`total_absences` bigint
,`total_delay_minutes` decimal(32,0)
,`justified_absences` bigint
,`unjustified_absences` bigint
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_absence_summary`
--
DROP TABLE IF EXISTS `v_absence_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_absence_summary`  AS SELECT `s`.`id` AS `student_id`, concat(`s`.`first_name`,' ',`s`.`last_name`) AS `student_name`, `sub`.`name` AS `subject_name`, count((case when (`a`.`is_absent` = 1) then 1 end)) AS `total_absences`, sum((case when (`a`.`delay_minutes` > 0) then `a`.`delay_minutes` else 0 end)) AS `total_delay_minutes`, count((case when ((`a`.`is_absent` = 1) and (`a`.`is_justified` = 1)) then 1 end)) AS `justified_absences`, count((case when ((`a`.`is_absent` = 1) and (`a`.`is_justified` = 0)) then 1 end)) AS `unjustified_absences` FROM (((`students` `s` join `absences` `a` on((`s`.`id` = `a`.`student_id`))) join `sessions` `se` on((`a`.`session_id` = `se`.`id`))) join `subjects` `sub` on((`se`.`subject_id` = `sub`.`id`))) GROUP BY `s`.`id`, `sub`.`id` ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `absences`
--
ALTER TABLE `absences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_absence` (`student_id`,`session_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `recorded_by` (`recorded_by`);

--
-- Index pour la table `campuses`
--
ALTER TABLE `campuses`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `filieres`
--
ALTER TABLE `filieres`
  ADD PRIMARY KEY (`id`),
  ADD KEY `campus_id` (`campus_id`);

--
-- Index pour la table `groups`
--
ALTER TABLE `groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `filiere_id` (`filiere_id`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `professor_id` (`professor_id`),
  ADD KEY `filiere_id` (`filiere_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Index pour la table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `code_apogee` (`code_apogee`),
  ADD KEY `filiere_id` (`filiere_id`),
  ADD KEY `campus_id` (`campus_id`),
  ADD KEY `group_id` (`group_id`);

--
-- Index pour la table `student_states`
--
ALTER TABLE `student_states`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_state` (`student_id`,`subject_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Index pour la table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `filiere_id` (`filiere_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `campus_id` (`campus_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `absences`
--
ALTER TABLE `absences`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `campuses`
--
ALTER TABLE `campuses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `filieres`
--
ALTER TABLE `filieres`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `groups`
--
ALTER TABLE `groups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `sessions`
--
ALTER TABLE `sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `students`
--
ALTER TABLE `students`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT pour la table `student_states`
--
ALTER TABLE `student_states`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `absences`
--
ALTER TABLE `absences`
  ADD CONSTRAINT `absences_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `absences_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`),
  ADD CONSTRAINT `absences_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `filieres`
--
ALTER TABLE `filieres`
  ADD CONSTRAINT `filieres_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`);

--
-- Contraintes pour la table `groups`
--
ALTER TABLE `groups`
  ADD CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD CONSTRAINT `sessions_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  ADD CONSTRAINT `sessions_ibfk_2` FOREIGN KEY (`professor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `sessions_ibfk_3` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`),
  ADD CONSTRAINT `sessions_ibfk_4` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`),
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`),
  ADD CONSTRAINT `students_ibfk_3` FOREIGN KEY (`group_id`) REFERENCES `groups` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `student_states`
--
ALTER TABLE `student_states`
  ADD CONSTRAINT `student_states_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `student_states_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`);

--
-- Contraintes pour la table `subjects`
--
ALTER TABLE `subjects`
  ADD CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`filiere_id`) REFERENCES `filieres` (`id`);

--
-- Contraintes pour la table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`campus_id`) REFERENCES `campuses` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
