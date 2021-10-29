#!/usr/bin/env node
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
const inquirer_1 = require("inquirer");
const chalk_1 = __importDefault(require("chalk"));
const console_1 = require("console");
const clui_1 = require("clui");
const child_process_1 = require("child_process");
const currDir = process.cwd();
const versions = {
    foundry: "1",
    zustand: "3",
    wouter: "2",
    typesWouter: "2",
    reactQuery: "3",
};
const questions = [
    // TODO: Add more questions like "3d", "mobile", and more
    // TODO: Add templates for video and libraries which aren't "traditional frontends"
    {
        name: "name",
        type: "input",
        message: "What is the project called?",
        validate: (input) => !(0, fs_1.existsSync)((0, path_1.join)(currDir, input)),
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
        filter: (selection) => selection.map((str) => str.split(" - ")[0]),
        transformer: (selection) => selection.map((str) => str.split(" - ")[0]),
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
const createProjectDirectory = (newPath) => {
    if ((0, fs_1.existsSync)(newPath)) {
        console.log(chalk_1.default.red(`Folder ${newPath} already exists! Delete or use another name.`));
        return false;
    }
    (0, fs_1.mkdirSync)(newPath);
    return true;
};
const filesToSkip = ["node_modules", ".template.json"];
const copyDirectory = (templatePath, projectName, subDir = "") => {
    const progress = new clui_1.Spinner("Writing code...");
    progress.start();
    // read all files/folders (1 level) from template folder
    const filesToCreate = (0, fs_1.readdirSync)(templatePath);
    // loop each file/folder
    filesToCreate.forEach((file) => {
        const origFilePath = (0, path_1.join)(templatePath, file);
        progress.message(`Copying ${file}`);
        // get stats about the current file
        const stats = (0, fs_1.statSync)(origFilePath);
        // skip files that should not be copied
        if (filesToSkip.indexOf(file) > -1)
            return;
        if (stats.isFile()) {
            // read file content and transform it using template engine
            let contents = (0, fs_1.readFileSync)(origFilePath, "utf8");
            // write file to destination folder
            const writePath = (0, path_1.join)(currDir, projectName, subDir, file);
            (0, fs_1.writeFileSync)(writePath, contents, "utf8");
        }
        else if (stats.isDirectory()) {
            // create folder in destination folder
            (0, fs_1.mkdirSync)((0, path_1.join)(currDir, projectName, subDir, file));
            // copy files/folder inside current folder recursively
            copyDirectory((0, path_1.join)(templatePath, file), (0, path_1.join)(projectName, subDir, file));
        }
    });
    progress.stop();
};
const installDepsFromAnswers = (projectPath, answers) => {
    const pkg = require(`${projectPath}/package.json`);
    const variations = [];
    if (answers.foundry) {
        pkg.dependencies["@headstorm/foundry-react-ui"] = versions.foundry;
        variations.push("foundry");
    }
    if (answers.zustand) {
        pkg.dependencies["zustand"] = versions.zustand;
        // Add an empty store
        copyDirectory((0, path_1.join)(__dirname, "addonModules/zustand"), answers.name, "src");
    }
    if (answers.wouter) {
        pkg.dependencies["wouter"] = versions.wouter;
        pkg.devDependencies["@types/wouter"] = versions.typesWouter;
        variations.push("wouter");
        copyDirectory((0, path_1.join)(__dirname, "addonModules/wouter"), answers.name, "src");
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
        copyDirectory((0, path_1.join)(__dirname, `variations/${variations.join("-")}`), answers.name, "src");
    }
    require("fs").writeFileSync(`${projectPath}/package.json`, JSON.stringify(pkg, null, 2));
    console.log(chalk_1.default.greenBright("✔️", " ", "Addons added to package.json"));
};
(0, console_1.clear)();
console.log(chalk_1.default.blue.bold("Welcome to aVileBroker's React boilerplate!\nTell me about the app you want to make."));
(0, inquirer_1.prompt)(questions).then((answers) => {
    (0, console_1.clear)();
    const projectName = answers["name"];
    // const templatePath = join(__dirname, "templates", projectChoice);
    const templatePath = (0, path_1.join)(__dirname, "templates/base"); // hard coding to base until more templates come online
    const targetPath = (0, path_1.join)(currDir, projectName);
    if (!createProjectDirectory(targetPath)) {
        return;
    }
    console.log(chalk_1.default.greenBright("✔️", " ", "Successfully created project directory:", projectName));
    copyDirectory(templatePath, projectName);
    console.log(chalk_1.default.greenBright("✔️", " ", "Copied template contents"));
    installDepsFromAnswers(targetPath, answers);
    const installSpinner = new clui_1.Spinner("Installing dependencies...");
    installSpinner.start();
    (0, child_process_1.exec)(`cd ${targetPath} && yarn install`, () => {
        installSpinner.stop();
        console.log(chalk_1.default.greenBright("✔️", " ", "Installed dependencies"));
    });
});
//# sourceMappingURL=index.js.map