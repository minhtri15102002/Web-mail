-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 07, 2023 lúc 03:20 PM
-- Phiên bản máy phục vụ: 10.4.28-MariaDB
-- Phiên bản PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `nodejs`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `account`
--

CREATE TABLE `account` (
  `id` int(10) UNSIGNED NOT NULL,
  `Name` varchar(255) NOT NULL,
  `Email` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `PhoneNumber` int(20) NOT NULL,
  `activated` tinyint(1) NOT NULL DEFAULT 0,
  `avatar` varchar(255) DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `account`
--

INSERT INTO `account` (`id`, `Name`, `Email`, `Password`, `PhoneNumber`, `activated`, `avatar`, `role`) VALUES
(2, 'admin123456', 'admin@gmail.com', '$2b$10$./VzGLqdBEsULdNofBN/..WjGFLys6UApjgvVrpHS.J4SiUa.vtdy', 0, 1, 'chuyen_doi_ta (2) (1).jfif', 'admin'),
(11, 'MINH', 'nguyenvanb@gmail.com', '$2b$10$V/OgMZW0ZtjAgs3/VvL2kOhYxPKM.fFFnvKgPdOJRY2Q.yWH8RjUO', 966047831, 1, 'chuyen_doi_ta (2) (1).jfif', 'user'),
(12, 'User 1', 'user@gmail.com', '$2b$10$vvadWLp642e6fHCuoU4xKekjraQL2w/7bO8K0rkRsOkYpRzcgyULO', 123456789, 0, NULL, 'user');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `blocked_users`
--

CREATE TABLE `blocked_users` (
  `id` int(11) NOT NULL,
  `user_a` varchar(255) NOT NULL,
  `user_b` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `blocked_users`
--

INSERT INTO `blocked_users` (`id`, `user_a`, `user_b`, `created_at`) VALUES
(3, 'minhtri15102002@gmail.com', 'minhtri15102002@gmail.com', '2023-05-06 09:49:15'),
(4, 'user@gmail.com', 'admin@gmail.com', '2023-05-07 11:56:46'),
(5, 'user@gmail.com', 'admin@gmail.com', '2023-05-07 11:56:46'),
(6, 'admin@gmail.com', 'nguyenvanb@gmail.com', '2023-05-07 12:59:34');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `draft`
--

CREATE TABLE `draft` (
  `id` int(11) NOT NULL,
  `sender` varchar(255) NOT NULL,
  `receiver` varchar(255) NOT NULL,
  `bcc` varchar(255) NOT NULL,
  `cc` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `sendAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `draft`
--

INSERT INTO `draft` (`id`, `sender`, `receiver`, `bcc`, `cc`, `subject`, `content`, `sendAt`) VALUES
(1, 'admin@gmail.com', 'user@gmail.com', '', '', '', '<p>MFHDfsada</p>', '2023-05-07 11:43:36'),
(2, 'admin@gmail.com', 'user@gmail.com', '', '', '', '<p>Hello i\'m fine</p>', '2023-05-07 11:46:03'),
(3, 'admin@gmail.com', 'user@gmail.com', '', '', 'Hello', '<p>Hello</p>', '2023-05-07 11:57:48'),
(4, 'admin@gmail.com', 'admin@gmail.com', '', '', '', '<p>dsađa</p>', '2023-05-07 12:55:06'),
(5, 'nguyenvanb@gmail.com', 'admin@gmail.com', '', '', 'Hello', '<p>Midsa</p>', '2023-05-07 13:00:13');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `email`
--

CREATE TABLE `email` (
  `id` int(11) NOT NULL,
  `sender` varchar(100) NOT NULL,
  `from` varchar(100) NOT NULL,
  `to` varchar(100) NOT NULL,
  `bcc` varchar(100) DEFAULT NULL,
  `cc` varchar(100) DEFAULT NULL,
  `subject` text NOT NULL,
  `content` text NOT NULL,
  `sendAt` date NOT NULL,
  `starred` tinyint(1) NOT NULL DEFAULT 0,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `label_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `email`
--

INSERT INTO `email` (`id`, `sender`, `from`, `to`, `bcc`, `cc`, `subject`, `content`, `sendAt`, `starred`, `isRead`, `label_id`) VALUES
(46, 'admin123', 'admin@gmail.com', 'test@gmail.com', '', '', 'Send this to test', '', '2023-05-02', 0, 1, 3),
(47, 'admin123', 'admin@gmail.com', 'test@gmail.com', '', '', 'Hel', '', '2023-05-02', 0, 1, 3),
(48, 'admin123', 'admin@gmail.com', 'test@gmail.com', '', '', 'HElLLO', '', '2023-05-02', 0, 1, 3),
(89, 'admin123456', 'admin@gmail.com', 'minhtri15102002@gmail.com', '', '', 'dsa', '<p>d&acirc;d</p>', '2023-05-07', 0, 0, NULL),
(93, 'User', 'user@gmail.com', 'admin@gmail.com', '', '', '', '<p>fs&aacute;</p>', '2023-05-07', 1, 1, 6),
(97, 'admin123456', 'admin@gmail.com', 'nguyenvanb@gmail.com', '', '', 'RE:Hello', '<p>Reply</p>', '2023-05-07', 0, 1, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `labels`
--

CREATE TABLE `labels` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `labels`
--

INSERT INTO `labels` (`id`, `name`, `user_id`, `created_at`) VALUES
(3, 'Snickers Chocolate Bars', 2, '2023-05-04 05:29:34'),
(6, 'Minh Tri', 2, '2023-05-04 06:16:58'),
(11, 'MTP', 1, '2023-05-04 12:02:10'),
(12, 'MJ', 1, '2023-05-05 08:02:45');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trash`
--

CREATE TABLE `trash` (
  `id` int(11) NOT NULL,
  `sender` varchar(255) DEFAULT NULL,
  `receiver` varchar(255) DEFAULT NULL,
  `bcc` varchar(255) DEFAULT NULL,
  `cc` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `sendAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `trash`
--

INSERT INTO `trash` (`id`, `sender`, `receiver`, `bcc`, `cc`, `subject`, `content`, `sendAt`) VALUES
(7, 'User', 'admin@gmail.com', '', '', 'RE:Hello', '<p>Nice</p>', '2023-05-06 17:00:00'),
(8, 'admin123456', 'user@gmail.com', '', 'user@gmail.com', 'Hello', '<p>Hello my friend</p>', '2023-05-06 17:00:00'),
(9, 'User', 'admin@gmail.com', '', '', '', '<p>My name</p>\n<p>&nbsp;</p>', '2023-05-06 17:00:00'),
(10, 'Nguyen Van B ', 'admin@gmail.com', '', '', 'Hello', '<p>sđấ</p>', '2023-05-06 17:00:00');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `draft`
--
ALTER TABLE `draft`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `email`
--
ALTER TABLE `email`
  ADD PRIMARY KEY (`id`),
  ADD KEY `label_id` (`label_id`);

--
-- Chỉ mục cho bảng `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `trash`
--
ALTER TABLE `trash`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `account`
--
ALTER TABLE `account`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `blocked_users`
--
ALTER TABLE `blocked_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `draft`
--
ALTER TABLE `draft`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `email`
--
ALTER TABLE `email`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- AUTO_INCREMENT cho bảng `labels`
--
ALTER TABLE `labels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `trash`
--
ALTER TABLE `trash`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `email`
--
ALTER TABLE `email`
  ADD CONSTRAINT `email_ibfk_1` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
