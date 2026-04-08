-- AlterTable
ALTER TABLE `ContributorSubmission` ADD COLUMN `order` INT NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `ContributorSubmission_contributorId_idx` ON `ContributorSubmission`(`contributorId`);

-- Backfill: anthology별 createdAt asc 순으로 order 0..N-1 세팅
SET @rownum := 0;
SET @prev_anth := NULL;
UPDATE `ContributorSubmission` cs
JOIN (
  SELECT
    cs2.id,
    @rownum := IF(@prev_anth = c2.anthologyId, @rownum + 1, 0) AS rn,
    @prev_anth := c2.anthologyId AS anth
  FROM `ContributorSubmission` cs2
  JOIN `Contributor` c2 ON c2.id = cs2.contributorId
  ORDER BY c2.anthologyId ASC, cs2.createdAt ASC, cs2.id ASC
) t ON t.id = cs.id
SET cs.`order` = t.rn;
