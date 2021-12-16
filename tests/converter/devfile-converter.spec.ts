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
import { Validator } from 'jsonschema';
import { Devfile } from '../../src/api/devfile';

describe('Test Devfile converter', () => {
  let devfileConverter: DevfileConverter;

  let schemaV1;
  let schemaV2_1_0;
  let schemaV2_2_0;

  beforeAll(async () => {
    const schemaV1Path = path.resolve(__dirname, '..', '_data', 'devfile-1.0-schema.json');
    const schemaV1Content = await fs.readFile(schemaV1Path, 'utf-8');
    schemaV1 = JSON.parse(schemaV1Content);

    const schemaV2_1_0_Path = path.resolve(__dirname, '..', '_data', 'devfile-2-1-0-schema.json');
    const schemaV2_1_0_Content = await fs.readFile(schemaV2_1_0_Path, 'utf-8');
    schemaV2_1_0 = JSON.parse(schemaV2_1_0_Content);

    const schemaV2_2_0_Path = path.resolve(__dirname, '..', '_data', 'devfile-2-2-0-schema.json');
    const schemaV2_2_0_Content = await fs.readFile(schemaV2_2_0_Path, 'utf-8');
    schemaV2_2_0 = JSON.parse(schemaV2_2_0_Content);
  });

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

  test('convert v1 -> v2 devfile-eclipse-che-server-v1.yaml', async () => {
    const devfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-eclipse-che-server-v1.yaml');
    const devfileContent = await fs.readFile(devfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV2, schemaV2_1_0);
    expect(validationResult.valid).toBeTruthy();

    // check command id no longer has space
    const buildCommand = convertedDevfileV2.commands.find(
      command => command.exec && command.exec.commandLine === 'mvn clean install -DskipTests'
    );
    expect(buildCommand).toBeDefined();
    expect(buildCommand.id).toEqual('build-without-tests');
    // check label is there
    expect(buildCommand.exec.label).toEqual('build without tests');

    // check we have a volume component for the m2 volume
    const m2Volume = convertedDevfileV2.components.find(component => component.name === 'm2' && component.volume);
    expect(m2Volume).toBeDefined();
  });

  test('convert v1 -> v2 devfile-eclipse-che-dashboard-v1.yaml', async () => {
    const devfileYamlPath = path.resolve(__dirname, '..', '_data', 'devfile-eclipse-che-dashboard-v1.yaml');
    const devfileContent = await fs.readFile(devfileYamlPath, 'utf-8');
    const devfileV1 = jsYaml.load(devfileContent);

    const convertedDevfileV2 = await devfileConverter.devfileV1toDevfileV2(devfileV1);
    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV2, schemaV2_2_0);
    expect(validationResult.valid).toBeTruthy();

    // check command id no longer has space
    const buildCommand = convertedDevfileV2.commands.find(
      command => command.exec && command.exec.commandLine === 'yarn install && yarn compile'
    );
    expect(buildCommand).toBeDefined();
    // check brackets are removed and spaces are replaced with '-'
    expect(buildCommand.id).toEqual('ud-compile');
    // check original label is still there
    expect(buildCommand.exec.label).toEqual('[UD] compile');

    // check metata.name has no trailing -
    expect(convertedDevfileV2.metadata.name).toEqual('che-dashboard-react');
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

    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV1, schemaV1);
    expect(validationResult.valid).toBeTruthy();
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
    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV1, schemaV1);
    expect(validationResult.valid).toBeTruthy();
  });

  test('convert v2 -> v1 devfile-v2-from-dashboard.yaml has a valid schema', async () => {
    const devfileV2YamlPath = path.resolve(__dirname, '..', '_data', 'devfile-v2-from-dashboard.yaml');
    const devfileV2Content = await fs.readFile(devfileV2YamlPath, 'utf-8');
    const devfileV2 = jsYaml.load(devfileV2Content);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(devfileV2);

    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV1, schemaV1);
    expect(validationResult.valid).toBeTruthy();
  });

  test('convert v2.2 -> v1 devfile-samples-java-springboot-basic-v2_2.yaml', async () => {
    const devfileV2YamlPath = path.resolve(__dirname, '..', '_data', 'devfile-samples-java-springboot-basic-v2_2.yaml');
    const devfileV2Content = await fs.readFile(devfileV2YamlPath, 'utf-8');
    const devfileV2 = jsYaml.load(devfileV2Content);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(devfileV2);

    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV1, schemaV1);
    expect(validationResult.valid).toBeTruthy();

    // expect we have tools component
    const toolsComponent = convertedDevfileV1.components.find(
      component => component.type === 'dockerimage' && component.alias === 'tools'
    );
    expect(toolsComponent).toBeDefined();
    expect(toolsComponent.mountSources).toBeTruthy();

    // expect we have only 3 commands, the exec commands
    expect(convertedDevfileV1.commands.length).toBe(3);

    // working directory should be set
    const buildCommand = convertedDevfileV1.commands.find(command => command.name === 'build');
    expect(buildCommand).toBeDefined();
    expect(buildCommand?.actions[0]?.workdir).toBe('${CHE_PROJECTS_ROOT}/devfile-sample-java-springboot-basic');
  });

  test('convert v2.2 -> v1 devfile-samples-java-quarkus-v2_2-old.yaml', async () => {
    const devfileV2YamlPath = path.resolve(__dirname, '..', '_data', 'devfile-samples-java-quarkus-v2_2-old.yaml');
    const devfileV2Content = await fs.readFile(devfileV2YamlPath, 'utf-8');
    const devfileV2 = jsYaml.load(devfileV2Content);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(devfileV2);

    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV1, schemaV1);
    expect(validationResult.valid).toBeTruthy();

    // expect we have tools component
    const toolsComponent = convertedDevfileV1.components.find(
      component => component.type === 'dockerimage' && component.alias === 'tools'
    );
    expect(toolsComponent).toBeDefined();
    expect(toolsComponent.mountSources).toBeTruthy();

    // expect we have only 3 commands, the exec commands
    expect(convertedDevfileV1.commands.length).toBe(3);

    // working directory should be set
    const initCompileCommand = convertedDevfileV1.commands.find(command => command.name === 'init-compile');
    expect(initCompileCommand).toBeDefined();
    expect(initCompileCommand?.actions[0]?.workdir).toBe('${CHE_PROJECTS_ROOT}/devfile-sample-code-with-quarkus');

    // check placeHolder component is not there anymore
    const placeHolderComponent = convertedDevfileV1.components.find(
      component => component.type === 'dockerimage' && component.image === 'buildguidanceimage-placeholder'
    );
    expect(placeHolderComponent).toBeUndefined();

    // check the che nightly images have been replaced by next component
    expect(toolsComponent.image).toBe('quay.io/eclipse/che-quarkus:next');
  });

  test('convert v2.2 -> v1 devfile-samples-python_2_2.yaml', async () => {
    const devfileV2YamlPath = path.resolve(__dirname, '..', '_data', 'devfile-samples-python_2_2.yaml');
    const devfileV2Content = await fs.readFile(devfileV2YamlPath, 'utf-8');
    const devfileV2 = jsYaml.load(devfileV2Content);
    const convertedDevfileV1 = await devfileConverter.devfileV2toDevfileV1(devfileV2);

    var v = new Validator();
    const validationResult = v.validate(convertedDevfileV1, schemaV1);
    expect(validationResult.valid).toBeTruthy();

    // expect we have py-web component
    const pyWebComponent = convertedDevfileV1.components.find(
      component => component.type === 'dockerimage' && component.alias === 'py-web'
    );
    expect(pyWebComponent).toBeDefined();
    expect(pyWebComponent.mountSources).toBeTruthy();

    // expect we have only 3 commands, the exec commands
    expect(convertedDevfileV1.commands.length).toBe(3);

    // working directory should be set
    const runAppCommand = convertedDevfileV1.commands.find(command => command.name === 'run-app');
    expect(runAppCommand).toBeDefined();
    expect(runAppCommand?.actions[0]?.workdir).toBe('${CHE_PROJECTS_ROOT}/devfile-sample-python-basic');

    // check placeHolder component is not there anymore
    const placeHolderComponent = convertedDevfileV1.components.find(
      component => component.type === 'dockerimage' && component.image === 'buildguidanceimage-placeholder'
    );
    expect(placeHolderComponent).toBeUndefined();

    // check the che nightly image is there for this one
    expect(pyWebComponent.image).toBe('quay.io/eclipse/che-python-3.7:nightly');
  });

  test('processVolumesFromDevfileV2', async () => {
    const devfileV2: Devfile = {
      schemaVersion: '2.1.0',
      metadata: {
        name: 'test-devfile',
      },
      components: [
        {
          name: 'volume',
          volume: {},
        },
        {
          name: 'tool',
          container: {
            image: 'tool',
            volumeMounts: [
              {
                name: 'volume',
                path: '/volume',
              },
              {
                name: 'm2',
                path: '/path/maven',
              },
            ],
          },
        },
      ],
    };
    await devfileConverter.processVolumesFromDevfileV2(devfileV2);

    var v = new Validator();
    const validationResult = v.validate(devfileV2, schemaV2_1_0);
    expect(validationResult.valid).toBeTruthy();

    // expect one new component for the volume mounts
    expect(devfileV2.components.length).toBe(3);

    const m2Volume = devfileV2.components.find(component => component.name === 'm2');
    expect(m2Volume).toBeDefined();
    expect(m2Volume.volume).toBeDefined();
  });
});
