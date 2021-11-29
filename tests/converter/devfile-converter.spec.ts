/**********************************************************************
 * Copyright (c) 2021 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 ***********************************************************************/
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */

import 'reflect-metadata';

import * as fs from 'fs-extra';
import * as jsYaml from 'js-yaml';
import * as path from 'path';

import { DevfileConverter } from '../../src/converter/devfile-converter';
import { Container } from 'inversify';
import { che } from '@eclipse-che/api';

describe('Test Devfile converter', () => {
  let devfileConverter: DevfileConverter;

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    const container = new Container();

    container.bind(DevfileConverter).toSelf().inSingletonScope();
    devfileConverter = container.get(DevfileConverter);
  });

  test('convert v1/v2', async () => {
    // convert devfile1 to devfile2 to devfile1 and see if it's the same object
    const devfileV1: che.workspace.devfile.Devfile = {
      apiVersion: '1.0.0',
      metadata: {
        generateName: 'hello',
      },

      projects: [
        {
          name: 'my-project',

          source: {
            type: 'git',
            location: 'https://github.com/this-is-a-test',
            branch: 'myBranch',
          },
        },
      ],
    };
    const convertedToDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedToDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedToDevfileV2);
    expect(convertedToDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 che-theia devfile.yaml', async () => {
    const cheTheiaDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'che-theia-devfile-developers-v1.yaml');
    const devfileContent = await fs.readFile(cheTheiaDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);
    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 go devfile.yaml', async () => {
    const cheTheiaDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-go-v1.yaml');
    const devfileContent = await fs.readFile(cheTheiaDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);
    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 java-webspring devfile.yaml', async () => {
    const devfileV1Path = path.resolve(__dirname, '..', '_data', 'devfile-java-webspring-v1.yaml');
    const devfileContent = await fs.readFile(devfileV1Path, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 devfile-dummv1.yaml', async () => {
    const cheTheiaDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-dummy-v1.yaml');
    const devfileContent = await fs.readFile(cheTheiaDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 custom editor with reference devfile.yaml', async () => {
    const cheTheiaDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-custom-editor.yaml');
    const devfileContent = await fs.readFile(cheTheiaDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 custom editor with id devfile.yaml', async () => {
    const editorDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-custom-editor-id.yaml');
    const devfileContent = await fs.readFile(editorDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 invalid editor', async () => {
    const editorDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-invalid-editor.yaml');
    const devfileContent = await fs.readFile(editorDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    await expect(devfileConverter.devfileV1toDevfileV2(devfileV1)).rejects.toThrow(
      'Only one editor component is supported'
    );
  });

  test('convert v1/v2 kubernetes component devfile.yaml', async () => {
    const cheTheiaDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-kubernetes-component.yaml');
    const devfileContent = await fs.readFile(cheTheiaDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 openshift component devfile.yaml', async () => {
    const cheTheiaDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-openshift-component.yaml');
    const devfileContent = await fs.readFile(cheTheiaDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 devfile-attributes.yaml', async () => {
    const cheTheiaDevfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-attributes.yaml');
    const devfileContent = await fs.readFile(cheTheiaDevfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 devfile-user1.yaml', async () => {
    const devfileUser1YamlPath = path.resolve(__dirname, '..', '_data', 'devfile-user-v1.yaml');
    const devfileContent = await fs.readFile(devfileUser1YamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);
    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v1/v2 devfile-project-source-v1.yaml', async () => {
    const devfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-project-source-v1.yaml');
    const devfileContent = await fs.readFile(devfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);
    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(convertedDevfileV2);
    expect(convertedDevfileV1).toEqual(devfileV1);
  });

  test('convert v2 -> v1 devfile-petclinc-devfilev2.yaml', async () => {
    const devfileV2YamlPath = path.resolve(__dirname, '..', '_data', 'devfile-petclinc-devfilev2.yaml');
    const devfileV2Content = await fs.readFile(devfileV2YamlPath, 'utf-8');
    const devfileV2 = jsYaml.load(devfileV2Content);

    const vsCodeExtensionsJsonPath = path.resolve(
      __dirname,
      '..',
      '_data',
      'devfile-petclinc-devfilev2-vscodeextensions.json'
    );
    const vsCodeExtensionsJsonContent = await fs.readFile(vsCodeExtensionsJsonPath, 'utf-8');

    const vsCodeExtensionsLaunchPath = path.resolve(
      __dirname,
      '..',
      '_data',
      'devfile-petclinc-devfilev2-vscodelaunch.json'
    );
    const vsCodeExtensionsLaunchContent = await fs.readFile(vsCodeExtensionsLaunchPath, 'utf-8');

    const externalAccess = async function (file: string): Promise<string> {
      if (file === devfileConverter.VSCODE_EXTENSIONS_JSON) {
        return vsCodeExtensionsJsonContent;
      }
      if (file === devfileConverter.VSCODE_LAUNCH_JSON) {
        return vsCodeExtensionsLaunchContent;
      }
      if (file === devfileConverter.CHE_EDITOR_YAML) {
        return '---';
      }
      if (file === devfileConverter.CHE_THEIA_PLUGINS_YAML) {
        return '---';
      }
      return undefined;
    };

    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(devfileV2, externalAccess);

    // check we have the redhat/java plugin
    const javaPlugin = convertedDevfileV1.components.find(
      component => component.type === 'chePlugin' && component.id === 'redhat/java/latest'
    );
    expect(javaPlugin).toBeDefined();

    // check we have the launch command
    const debugCommand = convertedDevfileV1.commands.find(command => command.name === 'Debug (Attach) - Remote');
    expect(debugCommand).toStrictEqual({
      name: 'Debug (Attach) - Remote',
      actions: [
        {
          type: 'vscode-launch',
          referenceContent:
            '{\n  "version": "0.2.0",\n  "configurations": [\n      {\n          "type": "java",\n          "name": "Debug (Attach) - Remote",\n          "request": "attach",\n          "hostName": "localhost",\n          "port": 5005\n      }\n  ]\n}\n',
        },
      ],
    });

    // check that the variable is correct
    const runCommand = convertedDevfileV1.commands.find(command => command.name === 'run-with-mysql');
    expect(runCommand).toBeDefined();
    // check PROJECTS_ROOT is renamed to CHE_PROJECTS_ROOT
    expect(runCommand.actions[0].workdir).toStrictEqual('${CHE_PROJECTS_ROOT}/java-spring-petclinic');

    // check mountSources is there when not specified as default is not the same
    const toolsComponent = convertedDevfileV1.components.find(
      component => component.type === 'dockerimage' && component.alias === 'tools'
    );
    expect(toolsComponent).toBeDefined();
    expect(toolsComponent.mountSources).toBeTruthy();

    const mysqlComponent = convertedDevfileV1.components.find(
      component => component.type === 'dockerimage' && component.alias === 'mysql'
    );
    expect(mysqlComponent).toBeDefined();
    expect(mysqlComponent.mountSources).toBeTruthy();
  });

  test('convert v2 -> v1 devfile-petclinc-devfile-empty-v2.yaml', async () => {
    const devfileV2YamlPath = path.resolve(__dirname, '..', '_data', 'devfile-petclinc-devfile-empty-v2.yaml');
    const devfileV2Content = await fs.readFile(devfileV2YamlPath, 'utf-8');
    const devfileV2 = jsYaml.load(devfileV2Content);

    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(devfileV2);
    expect(convertedDevfileV1).toStrictEqual({
      apiVersion: '1.0.0',
      metadata: {
        generateName: 'empty',
      },
    });
  });
});
