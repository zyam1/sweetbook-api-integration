-- AlterTable
ALTER TABLE `Order` ADD COLUMN `userId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Project` ADD COLUMN `lastEditedAt` DATETIME(3) NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- CreateTable
CREATE TABLE `Anthology` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ownerId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `bookSpecUid` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `coverTemplateUid` VARCHAR(191) NULL,
    `coverFrontPhoto` VARCHAR(191) NULL,
    `coverBackPhoto` VARCHAR(191) NULL,
    `deadline` DATETIME(3) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'RECRUITING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Anthology_ownerId_idx`(`ownerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contributor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `anthologyId` INTEGER NOT NULL,
    `userId` INTEGER NULL,
    `handle` VARCHAR(191) NULL,
    `allocatedPages` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `inviteToken` VARCHAR(191) NOT NULL,
    `deadline` DATETIME(3) NULL,
    `tokenUsedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Contributor_inviteToken_key`(`inviteToken`),
    INDEX `Contributor_anthologyId_idx`(`anthologyId`),
    INDEX `Contributor_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContributorSubmission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contributorId` INTEGER NOT NULL,
    `fileName` VARCHAR(191) NOT NULL,
    `storedPath` VARCHAR(191) NOT NULL,
    `mimeType` VARCHAR(191) NULL,
    `sizeBytes` INTEGER NULL,
    `dpi` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_userId_idx` ON `Order`(`userId`);

-- CreateIndex
CREATE INDEX `Project_userId_idx` ON `Project`(`userId`);

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anthology` ADD CONSTRAINT `Anthology_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contributor` ADD CONSTRAINT `Contributor_anthologyId_fkey` FOREIGN KEY (`anthologyId`) REFERENCES `Anthology`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contributor` ADD CONSTRAINT `Contributor_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContributorSubmission` ADD CONSTRAINT `ContributorSubmission_contributorId_fkey` FOREIGN KEY (`contributorId`) REFERENCES `Contributor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
