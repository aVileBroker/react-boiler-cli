#!/usr/bin/env node

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { prompt, QuestionCollection } from "inquirer";
import chalk from "chalk";
import { clear } from "console";
import { Spinner } from "clui";
import { exec } from "child_process";

// Create new folder
// Copy in base modified create-react-app
// Update package.json and copy in more content for answers

// ? Foundry UI? (y/n)
// ? Global state with Zustand? (y/n)
// ? Routing with Wouter? (y/n)
// ? (If foundry and wouter) Do you want to start with basic UI screens?
//   ( ) Login page
//   ( ) Main app page
//   ( ) Top navigation
//   ( ) ...
// ? Install other useful packages? (optional)
//   ( ) react-spring - physically based animations
//   ( ) @mdi/js - icon paths compatible with foundry-ui
//   ( ) polished - color management
//   ( ) use-gesture -
//   ( ) react-dnd - drag and drop support on touch/mouse
//   ( ) fuse.js - fuzzy-search client-side data

// yarn install

const CURR_DIR = process.cwd();

const questions: QuestionCollection<any> = [
  {
    name: "name",
    type: "input",
    message: "What is the project called?",
    validate: (input) => !existsSync(join(CURR_DIR, input)),
  },
  {
    name: "foundry",
    type: "confirm",
    message: "Foundry UI?",
  },
  {
    name: "zustand",
    type: "confirm",
    message: "Page routing with wouter?",
  },
  {
    name: "data",
    type: "list",
    message: "Data fetcher?",
    choices: ["GraphQL", "JSON", "none"],
    default: "none",
  },
  {
    name: "addons",
    type: "checkbox",
    message: "Install other useful packages? (optional)",
    choices: [
      `${chalk.bold("react-spring")} - physically based animations`,
      `${chalk.bold("@mdi/js")} - icon paths compatible with foundry-ui`,
      `${chalk.bold("polished")} - color management`,
      `${chalk.bold("use-gesture")} - gesture support`,
      `${chalk.bold("react-dnd")} - drag and drop support on touch/mouse`,
      `${chalk.bold("fuse.js")} - fuzzy-search client-side data`,
    ],
  },
];

const deps: string[] = [];
const devDeps: string[] = [];

export interface CliOptions {
  projectName: string;
  templatePath: string;
  targetPath: string;
}

const createProjectDirectory = (newPath: string) => {
  if (existsSync(newPath)) {
    console.log(
      chalk.red(`Folder ${newPath} already exists! Delete or use another name.`)
    );
    return false;
  }
  mkdirSync(newPath);
  return true;
};

const filesToSkip = ["node_modules", ".template.json"];

const createDirectoryContents = (templatePath: string, projectName: string) => {
  const progress = new Spinner("Writing code...");
  progress.start();

  // read all files/folders (1 level) from template folder
  const filesToCreate = readdirSync(templatePath);
  // loop each file/folder
  filesToCreate.forEach((file) => {
    const origFilePath = join(templatePath, file);

    progress.message(`Copying ${file}`);

    // get stats about the current file
    const stats = statSync(origFilePath);

    // skip files that should not be copied
    if (filesToSkip.indexOf(file) > -1) return;

    if (stats.isFile()) {
      // read file content and transform it using template engine
      let contents = readFileSync(origFilePath, "utf8");
      // write file to destination folder
      const writePath = join(CURR_DIR, projectName, file);
      writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      // create folder in destination folder
      mkdirSync(join(CURR_DIR, projectName, file));
      // copy files/folder inside current folder recursively
      createDirectoryContents(
        join(templatePath, file),
        join(projectName, file)
      );
    }
  });

  progress.stop();
};

const installDepsFromAnswers = (answers) => {
  if (answers.foundry) {
    deps.push("@headstorm/foundry-react-ui");
  }
  if (answers.zustand) {
    deps.push("zustand");
  }
  if (answers.data === "JSON") {
    deps.push("react-query");
  }

  exec(`yarn add ${deps.join(" ")}`);
};

clear();
console.log(
  chalk.blue.bold(
    "Welcome to aVileBroker's React boilerplate! Tell me about the app you want to make."
  )
);
prompt(questions).then((answers) => {
  const projectName = answers["name"];
  // const templatePath = join(__dirname, "templates", projectChoice);
  const templatePath = join(__dirname, "templates/base"); // hard coding to base until more templates come online
  const targetPath = join(CURR_DIR, projectName);
  const options: CliOptions = {
    projectName,
    templatePath,
    targetPath,
  };
  if (!createProjectDirectory(targetPath)) {
    return;
  }
  console.log(
    chalk.greenBright(
      "✔️",
      " ",
      "Successfully created project directory:",
      projectName
    )
  );
  createDirectoryContents(templatePath, projectName);
  console.log(chalk.greenBright("✔️", " ", "Copied template contents"));

  exec("yarn install");
  installDepsFromAnswers(answers);
  console.log(answers);
});
