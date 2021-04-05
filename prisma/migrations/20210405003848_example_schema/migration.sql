-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `postId` VARCHAR(191),
UNIQUE INDEX `User.email_unique`(`email`),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Post` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
