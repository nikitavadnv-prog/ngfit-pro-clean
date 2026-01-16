ALTER TABLE `clients` ADD `telegramId` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `height` integer;--> statement-breakpoint
ALTER TABLE `clients` ADD `weight` integer;--> statement-breakpoint
ALTER TABLE `clients` ADD `gender` text;--> statement-breakpoint
ALTER TABLE `clients` ADD `goals` text;--> statement-breakpoint
CREATE UNIQUE INDEX `clients_telegramId_unique` ON `clients` (`telegramId`);