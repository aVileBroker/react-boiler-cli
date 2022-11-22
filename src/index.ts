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

const currDir = process.cwd();

const versions: { [key in string]: string } = {
  foundry: "1",
  zustand: "3",
  wouter: "2",
  typesWouter: "2",
  reactQuery: "3",
  capacitor: "4",
};

const questions: QuestionCollection<any> = [
  // TODO: Add more questions like "3d"
  // TODO: Add templates for video and libraries which aren't "traditional frontends"
  {
    name: "name",
    type: "input",
    message: "What is the project called?",
    validate: (input) => !existsSync(join(currDir, input)),
  },
  {
    name: "capacitor",
    type: "confirm",
    message: "Create native mobile builds?",
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

export interface Answers {
  name: string;
  foundry: boolean;
  zustand: boolean;
  wouter: boolean;
  capacitor: boolean;
  android: boolean;
  ios: boolean;
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

const copyDirectory = (
  templatePath: string,
  projectName: string,
  subDir: string = ""
) => {
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
      const writePath = join(currDir, projectName, subDir, file);
      writeFileSync(writePath, contents, "utf8");
    } else if (stats.isDirectory()) {
      // create folder in destination folder
      mkdirSync(join(currDir, projectName, subDir, file));
      // copy files/folder inside current folder recursively
      copyDirectory(join(templatePath, file), join(projectName, subDir, file));
    }
  });

  progress.stop();
};

const installDepsFromAnswers = (projectPath: string, answers: Answers) => {
  const pkg = require(`${projectPath}/package.json`);

  const variations: string[] = [];

  if (answers.foundry) {
    pkg.dependencies["@headstorm/foundry-react-ui"] = versions.foundry;
    variations.push("foundry");
  }
  if (answers.zustand) {
    pkg.dependencies["zustand"] = versions.zustand;
    // Add an empty store
    copyDirectory(join(__dirname, "addonModules/zustand"), answers.name, "src");
  }
  if (answers.wouter) {
    pkg.dependencies["wouter"] = versions.wouter;
    pkg.devDependencies["@types/wouter"] = versions.typesWouter;
    variations.push("wouter");
    copyDirectory(join(__dirname, "addonModules/wouter"), answers.name, "src");
  }

  // Capacitor
  if (answers.capacitor) {
    pkg.devDependencies["@capacitor/cli"] = versions.capacitor;
    pkg.dependencies["@capacitor/core"] = versions.capacitor;
    pkg.dependencies["@capacitor/ios"] = versions.capacitor;
    pkg.dependencies["@capacitor/android"] = versions.capacitor;

    pkg.scripts = { ...pkg.scripts, sync: "npx cap sync" };
    pkg.scripts = {
      ...pkg.scripts,
      "build-and-sync": "yarn build && npx cap sync",
    };

    if (answers.android) {
      pkg.scripts = { ...pkg.scripts, android: "npx cap run android" };
    }
    if (answers.ios) {
      pkg.scripts = { ...pkg.scripts, android: "npx cap run ios" };
    }
  }

  if (answers.data === "JSON") {
    pkg.dependencies["react-query"] = versions.reactQuery;
    // TODO: Learn how to use react-query and add the correct stuff here
  }
  answers.addons.forEach((addon) => {
    pkg.dependencies[addon] = versions[addon] || "*";
  });

  if (variations.length) {
    // copy App.tsx variations for the chosen setup
    copyDirectory(
      join(__dirname, `variations/${variations.join("-")}`),
      answers.name,
      "src"
    );
  }

  require("fs").writeFileSync(
    `${projectPath}/package.json`,
    JSON.stringify(pkg, null, 2)
  );

  console.log(chalk.greenBright(" ", "✔️ ", "Addons added to package.json"));
};

clear();
console.log(
  chalk.blue.bold(
    "Welcome to aVileBroker's React boilerplate!\nTell me about the app you want to make."
  )
);

prompt(questions).then((answers) => {
  clear();
  const projectName = answers["name"];
  // const templatePath = join(__dirname, "templates", projectChoice);
  const templatePath = join(__dirname, "templates/base"); // hard coding to base until more templates come online
  const targetPath = join(currDir, projectName);

  if (!createProjectDirectory(targetPath)) {
    return;
  }
  console.log(
    chalk.greenBright(
      " ",
      "✔️ ",
      "Successfully created project directory:",
      projectName
    )
  );

  copyDirectory(templatePath, projectName);
  console.log(chalk.greenBright(" ", "✔️ ", "Copied template contents"));

  installDepsFromAnswers(targetPath, answers);

  const installSpinner = new Spinner("Installing dependencies...");
  installSpinner.start();
  exec(`cd ${targetPath} && yarn install`, () => {
    installSpinner.stop();
    console.log(chalk.greenBright(" ", "✔️ ", "Installed dependencies"));
    console.log(chalk.greenBright(" ", "✔️ ", "Project creation complete"));

    console.log(
      chalk.blueBright(
        `Run 'yarn start' in /${projectName} to start the app on localhost:3000"`
      )
    );
  });
});
