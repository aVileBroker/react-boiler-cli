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

const CURR_DIR = process.cwd();

const questions: QuestionCollection<any> = [
  // TODO: Add more questions like "3d", "mobile", and more
  // TODO: Add templates for video and libraries which aren't "traditional frontends"
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
    message: "State management with zustand?",
  },
  {
    name: "wouter",
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
    filter: (selection: string[]) =>
      selection.map((str) => str.split(" - ")[0]),
    transformer: (selection: string[]) =>
      selection.map((str) => str.split(" - ")[0]),
    choices: [
      `react-spring - physically based animations`,
      `@mdi/js - icon paths compatible with foundry-ui`,
      `polished - color management`,
      `use-gesture - gesture support`,
      `react-dnd - drag and drop support on touch/mouse`,
      `fuse.js - fuzzy-search client-side data`,
    ],
  },
];

const deps: string[] = [];
const devDeps: string[] = [];

export interface Answers {
  name: string;
  foundry: boolean;
  zustand: boolean;
  wouter: boolean;
  data: string;
  addons: string[];
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

const installDepsFromAnswers = (projectPath: string, answers: Answers) => {
  if (answers.foundry) {
    deps.push("@headstorm/foundry-react-ui");
    // TODO: Add the provider to App.tsx
  }
  if (answers.zustand) {
    deps.push("zustand");
    // TODO: Add an empty store
  }
  if (answers.wouter) {
    deps.push("wouter");
    // TODO: Add a router provider to App.tsx
    // TODO: Add "screens" folder
  }
  if (answers.data === "JSON") {
    deps.push("react-query");
    // TODO: Learn how to use react-query and add the correct stuff here
  }
  const finalDeps = [...deps, ...answers.addons];

  const addonSpinner = new Spinner("Installing addon modules...");
  addonSpinner.start();
  exec(`cd ${projectPath} && yarn add ${finalDeps.join(" ")}`, (errorMsg) => {
    addonSpinner.stop();
    if (errorMsg) {
      console.error(errorMsg);
    }
  });
};

clear();
console.log(
  chalk.blue.bold(
    "Welcome to aVileBroker's React boilerplate! Tell me about the app you want to make."
  )
);
prompt(questions).then((answers) => {
  clear();
  const projectName = answers["name"];
  // const templatePath = join(__dirname, "templates", projectChoice);
  const templatePath = join(__dirname, "templates/base"); // hard coding to base until more templates come online
  const targetPath = join(CURR_DIR, projectName);

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

  const installSpinner = new Spinner("Installing base node modules...");
  installSpinner.start();
  exec(`cd ${targetPath} && yarn install`, () => installSpinner.stop());
  installDepsFromAnswers(targetPath, answers);
  console.log(chalk.greenBright("✔️", " ", "Installed dependencies"));
});
