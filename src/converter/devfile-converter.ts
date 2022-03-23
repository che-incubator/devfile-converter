import {
  V220DevfileCommands,
  V220DevfileComponents,
  V220DevfileComponentsItemsContainerEndpoints,
  V220DevfileComponentsItemsContainerEnv,
  V220DevfileComponentsItemsContainerVolumeMounts,
  V220DevfileProjects,
  V220DevfileProjectsItemsGit,
} from '@devfile/api';
import { che } from '@eclipse-che/api';
import { injectable } from 'inversify';
import { Devfile, DevfileMetadata } from '../api/devfile';
import * as jsYaml from 'js-yaml';
import * as jsoncparser from 'jsonc-parser';

@injectable()
export class DevfileConverter {
  public readonly CHE_EDITOR_YAML = '.che/che-editor.yaml';
  public readonly CHE_THEIA_PLUGINS_YAML = '.che/che-theia-plugins.yaml';
  public readonly VSCODE_EXTENSIONS_JSON = '.vscode/extensions.json';
  public readonly VSCODE_LAUNCH_JSON = '.vscode/launch.json';

  componentVolumeV1toComponentVolumeV2(
    componentVolumes?: che.workspace.devfile.DevfileVolume[]
  ): V220DevfileComponentsItemsContainerVolumeMounts[] | undefined {
    if (componentVolumes) {
      return componentVolumes.map(volumeV1 => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const volume: any = {};
        if (volumeV1.name) {
          volume.name = volumeV1.name;
          // volume names should not use _
          volume.name = volume.name.replace(/_/g, '-');
        }
        if (volumeV1.containerPath) {
          volume.path = volumeV1.containerPath;
        }
        return volume;
      });
    }
    return undefined;
  }

  componentVolumeV2toComponentVolumeV1(
    componentVolumes?: V220DevfileComponentsItemsContainerVolumeMounts[]
  ): che.workspace.devfile.DevfileVolume[] | undefined {
    if (componentVolumes) {
      return componentVolumes.map(volumeV2 => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const volume: any = {};
        if (volumeV2.name) {
          volume.name = volumeV2.name;
        }
        if (volumeV2.path) {
          volume.containerPath = volumeV2.path;
        }
        return volume;
      });
    }
    return undefined;
  }

  componentEndpointV1toComponentEndpointV2(
    componentEndpoints?: che.workspace.devfile.Endpoint[]
  ): V220DevfileComponentsItemsContainerEndpoints[] | undefined {
    if (componentEndpoints) {
      return componentEndpoints.map(endpointV1 => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const endpoint: any = {};
        if (endpointV1.name) {
          endpoint.name = endpointV1.name;
        }
        if (endpointV1.port) {
          endpoint.targetPort = endpointV1.port;
        }
        if (endpointV1.attributes) {
          endpoint.attributes = endpointV1.attributes;

          if (endpoint.attributes['type'] === 'ide') {
            endpoint.attributes['type'] = 'main';
          }

          if (endpointV1.attributes['public'] !== undefined && endpointV1.attributes['public'] === 'false') {
            endpoint.exposure = 'internal';
          }
        }

        return endpoint;
      });
    }
    return undefined;
  }

  componentEndpointV2toComponentEndpointV1(
    componentEndpoints?: V220DevfileComponentsItemsContainerEndpoints[]
  ): che.workspace.devfile.Endpoint[] | undefined {
    if (componentEndpoints) {
      return componentEndpoints.map(endpointV2 => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const endpoint: any = {};
        if (endpointV2.name) {
          endpoint.name = endpointV2.name;
        }
        if (endpointV2.targetPort) {
          endpoint.port = endpointV2.targetPort;
        }
        if (endpointV2.attributes) {
          endpoint.attributes = endpointV2.attributes;
        }
        if (endpointV2.exposure === V220DevfileComponentsItemsContainerEndpoints.ExposureEnum.Internal) {
          if (!endpoint.attributes) {
            endpoint.attributes = {};
          }
          endpoint.attributes['public'] = 'false';
        }
        return endpoint;
      });
    }
    return undefined;
  }

  componentEnvV1toComponentEnvV2(
    componentEnvs?: che.workspace.devfile.Env[]
  ): V220DevfileComponentsItemsContainerEnv[] | undefined {
    if (componentEnvs) {
      return componentEnvs.map(envV1 => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const env: any = {};
        if (envV1.name !== undefined) {
          env.name = envV1.name;
        }
        if (envV1.value !== undefined) {
          env.value = envV1.value;
        }
        return env;
      });
    }
    return undefined;
  }

  componentEnvV2toComponentEnvV1(
    componentEnvs?: V220DevfileComponentsItemsContainerEnv[]
  ): che.workspace.devfile.Env[] | undefined {
    if (componentEnvs) {
      return componentEnvs.map(envV2 => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const env: any = {};
        if (envV2.name !== undefined) {
          env.name = envV2.name;
        }
        if (envV2.value !== undefined) {
          env.value = envV2.value;
        }
        return env;
      });
    }
    return undefined;
  }

  componentV2toComponentV1(componentV2: V220DevfileComponents): che.workspace.devfile.Component {
    if (componentV2.kubernetes) {
      if (componentV2.kubernetes.inlined) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return JSON.parse(componentV2.kubernetes!.inlined!) as che.workspace.devfile.Component;
      } else {
        return undefined;
      }
    } else if (componentV2.openshift) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      return JSON.parse(componentV2.openshift!.inlined!) as che.workspace.devfile.Component;
    }

    const devfileV1Component: che.workspace.devfile.Component = {};

    if (componentV2.container) {
      devfileV1Component.type = 'dockerimage';

      if (componentV2.container.memoryLimit) {
        devfileV1Component.memoryLimit = componentV2.container.memoryLimit;
      }
      if (componentV2.container.memoryRequest) {
        devfileV1Component.memoryRequest = componentV2.container.memoryRequest;
      }
      if (componentV2.container.cpuLimit) {
        devfileV1Component.cpuLimit = componentV2.container.cpuLimit;
      }
      if (componentV2.container.cpuRequest) {
        devfileV1Component.cpuRequest = componentV2.container.cpuRequest;
      }
      if (componentV2.name) {
        devfileV1Component.alias = componentV2.name;
      }

      if (componentV2.container.mountSources) {
        devfileV1Component.mountSources = componentV2.container.mountSources;
      } else {
        // if not specified, mountSources needs to be added back on the container
        // as the default is not the same
        devfileV1Component.mountSources = true;
      }
      if (componentV2.container.args) {
        devfileV1Component.args = componentV2.container.args;
      }
      if (componentV2.container.command) {
        devfileV1Component.command = componentV2.container.command;
      }
      if (componentV2.container.image) {
        devfileV1Component.image = componentV2.container.image;
      }

      devfileV1Component.env = this.componentEnvV2toComponentEnvV1(componentV2.container.env);
      devfileV1Component.volumes = this.componentVolumeV2toComponentVolumeV1(componentV2.container.volumeMounts);
      devfileV1Component.endpoints = this.componentEndpointV2toComponentEndpointV1(componentV2.container.endpoints);
    }

    if (!devfileV1Component.env) {
      delete devfileV1Component.env;
    }
    if (!devfileV1Component.volumes) {
      delete devfileV1Component.volumes;
    }
    if (!devfileV1Component.endpoints) {
      delete devfileV1Component.endpoints;
    }
    if (Object.keys(devfileV1Component).length === 0) {
      return undefined;
    }
    return devfileV1Component;
  }

  componentV1toComponentV2(componentV1: che.workspace.devfile.Component): V220DevfileComponents {
    const devfileV2Component: any = {};

    if (componentV1.alias) {
      devfileV2Component.name = componentV1.alias;
    }

    if (componentV1.type === 'dockerimage') {
      devfileV2Component.container = {
        image: componentV1.image,
      };
      if (componentV1.command) {
        devfileV2Component.container.command = componentV1.command;
      }
      if (componentV1.args) {
        devfileV2Component.container.args = componentV1.args;
      }
      if (componentV1.cpuLimit) {
        devfileV2Component.container.cpuLimit = componentV1.cpuLimit;
      }
      if (componentV1.cpuRequest) {
        devfileV2Component.container.cpuRequest = componentV1.cpuRequest;
      }
      if (componentV1.memoryLimit) {
        devfileV2Component.container.memoryLimit = componentV1.memoryLimit;
      }
      if (componentV1.memoryRequest) {
        devfileV2Component.container.memoryRequest = componentV1.memoryRequest;
      }
      if (componentV1.mountSources) {
        devfileV2Component.container.mountSources = componentV1.mountSources;
      }
      devfileV2Component.container.env = this.componentEnvV1toComponentEnvV2(componentV1.env);
      devfileV2Component.container.volumeMounts = this.componentVolumeV1toComponentVolumeV2(componentV1.volumes);
      devfileV2Component.container.endpoints = this.componentEndpointV1toComponentEndpointV2(componentV1.endpoints);
    } else if (componentV1.type === 'kubernetes') {
      devfileV2Component.kubernetes = {};
      devfileV2Component.kubernetes.inlined = JSON.stringify(componentV1);
    } else if (componentV1.type === 'openshift') {
      devfileV2Component.openshift = {};
      devfileV2Component.openshift.inlined = JSON.stringify(componentV1);
    } else if (componentV1.type == 'chePlugin' || componentV1.type == 'cheEditor') {
      // components are processed as inline attributes
      return undefined;
    }

    return devfileV2Component;
  }

  commandV1toCommandV2(commandV1: che.workspace.devfile.DevfileCommand): V220DevfileCommands {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const devfileV2Command: any = {};

    if (commandV1.name) {
      // the id can't have spaces
      // replace space by dash and then remove all special characters
      devfileV2Command.id = commandV1.name
        .replace(/\s+/g, '-')
        .replace(/[^a-zA-Z-]/g, '')
        .toLowerCase();

      // needs to be max 63 characters
      if (devfileV2Command.id.length > 63) {
        devfileV2Command.id = devfileV2Command.id.substring(0, 63);
      }
      // trim '-' character from start or end
      devfileV2Command.id = devfileV2Command.id.replace(/^\-+|\-+$/g, '');
    }
    if (commandV1.actions && commandV1.actions[0].type === 'exec') {
      devfileV2Command.exec = {};
      const action = commandV1.actions[0];
      // label is the same as name
      if (commandV1.name) {
        devfileV2Command.exec.label = commandV1.name;
      }

      if (action.command) {
        devfileV2Command.exec.commandLine = action.command;
      }
      if (action.component) {
        devfileV2Command.exec.component = action.component;
      }
      if (action.workdir) {
        devfileV2Command.exec.workingDir = action.workdir;
      }
      return devfileV2Command;
    }
    // undefined if do not know what to do
    return undefined;
  }

  commandV2toCommandV1(commandV2: V220DevfileCommands): che.workspace.devfile.DevfileCommand {
    const devfileV1Command: che.workspace.devfile.DevfileCommand = {};

    if (commandV2.id) {
      devfileV1Command.name = commandV2.id;
    }

    if (commandV2.exec) {
      if (commandV2.exec.label) {
        devfileV1Command.name = commandV2.exec.label;
      }

      const devfileAction: che.workspace.devfile.DevfileAction = {};
      if (commandV2.exec.commandLine) {
        devfileAction.command = commandV2.exec.commandLine;
      }
      if (commandV2.exec.component) {
        devfileAction.component = commandV2.exec.component;
      }
      if (commandV2.exec.workingDir) {
        devfileAction.workdir = commandV2.exec.workingDir;
      }

      devfileAction.type = 'exec';
      devfileV1Command.actions = [devfileAction];
      return devfileV1Command;
    }
    return undefined;
  }

  projectV1toProjectV2(projectV1: che.workspace.devfile.Project): V220DevfileProjects {
    // the name can't have spaces
    // replace space by dash and then remove all special characters
    const projectName = projectV1.name
      .replace(/\s+/g, '-')
      // trim '-' character from start or end
      .replace(/^\-+|\-+$/g, '')
      .toLowerCase();

    const devfileV2Project: V220DevfileProjects = {
      attributes: {},
      name: projectName,
    };
    if (projectV1.clonePath) {
      devfileV2Project.clonePath = projectV1.clonePath;
    }

    if (projectV1.source) {
      const source = projectV1.source;
      if (source.type === 'git' || source.type === 'github') {
        const remotes = { origin: source.location };
        devfileV2Project.git = {
          remotes,
        };
        let checkoutFromRevision;
        if (source.branch) {
          checkoutFromRevision = source.branch;
          devfileV2Project.attributes['source-origin'] = 'branch';
        } else if (source.commitId) {
          checkoutFromRevision = source.commitId;
          devfileV2Project.attributes['source-origin'] = 'commitId';
        } else if (source.startPoint) {
          checkoutFromRevision = source.startPoint;
          devfileV2Project.attributes['source-origin'] = 'startPoint';
        } else if (source.tag) {
          checkoutFromRevision = source.tag;
          devfileV2Project.attributes['source-origin'] = 'tag';
        }
        if (checkoutFromRevision) {
          devfileV2Project.git.checkoutFrom = {
            revision: checkoutFromRevision,
          };
        }
      } else if (source.type === 'zip') {
        devfileV2Project.zip = {
          location: source.location,
        };
      }
    }
    return devfileV2Project;
  }

  projectInfoToProjectSource(
    project: V220DevfileProjects,
    projectInfo: V220DevfileProjectsItemsGit
  ): che.workspace.devfile.Source {
    const gitSource: che.workspace.devfile.Source = {};

    if (projectInfo.checkoutFrom) {
      if (project.attributes && project.attributes['source-origin']) {
        const origin = project.attributes['source-origin'];
        delete project.attributes['source-origin'];
        if (origin === 'branch') {
          gitSource.branch = projectInfo.checkoutFrom.revision;
        }
        if (origin === 'commitId') {
          gitSource.commitId = projectInfo.checkoutFrom.revision;
        }
        if (origin === 'startPoint') {
          gitSource.startPoint = projectInfo.checkoutFrom.revision;
        }
        if (origin === 'tag') {
          gitSource.tag = projectInfo.checkoutFrom.revision;
        }
      } else {
        gitSource.startPoint = projectInfo.checkoutFrom.revision;
      }
    }
    const remoteKeys = Object.keys(projectInfo.remotes);
    gitSource.location = projectInfo.remotes[remoteKeys[0]];
    gitSource.type = 'git';
    return gitSource;
  }

  metadataV1toMetadataV2(metadataV1?: che.workspace.devfile.Metadata): DevfileMetadata {
    const devfileMetadataV2: any = {};
    if (metadataV1) {
      if (metadataV1.generateName) {
        devfileMetadataV2.name = metadataV1.generateName;
        if (!devfileMetadataV2.attributes) {
          devfileMetadataV2.attributes = {};
        }
        devfileMetadataV2.attributes['metadata-name-field'] = 'generateName';
        devfileMetadataV2.attributes['metadata-name-original-value'] = metadataV1.generateName;
        // remove the trailing - to make it compliant with kubernetes name
        if (devfileMetadataV2.name.endsWith('-')) {
          devfileMetadataV2.name = devfileMetadataV2.name.slice(0, -1);
        }
      }
      if (metadataV1.name) {
        devfileMetadataV2.name = metadataV1.name;
        if (!devfileMetadataV2.attributes) {
          devfileMetadataV2.attributes = {};
        }
        devfileMetadataV2.attributes['metadata-name-field'] = 'name';
      }
    }
    return devfileMetadataV2;
  }

  metadataV2toMetadataV1(metadataV2?: DevfileMetadata): che.workspace.devfile.Metadata {
    const devfileMetadataV1: che.workspace.devfile.Metadata = {};
    if (metadataV2) {
      if (metadataV2.name) {
        const metaDataAttributes = metadataV2.attributes || {};
        const nameField = metaDataAttributes['metadata-name-field'];
        const originalValue = metaDataAttributes['metadata-name-original-value'];
        if (nameField === 'generateName' && originalValue) {
          devfileMetadataV1.generateName = originalValue;
        } else if (nameField === 'name') {
          devfileMetadataV1.name = metadataV2.name;
        } else {
          devfileMetadataV1.generateName = metadataV2.name;
        }
        if (metadataV2.attributes) {
          delete metadataV2.attributes['metadata-name-field'];
          delete metadataV2.attributes['metadata-name-original-value'];
        }
      }
    }
    return devfileMetadataV1;
  }

  projectV2toProjectV1(projectV2: V220DevfileProjects): che.workspace.devfile.Project {
    const devfileV1Project: che.workspace.devfile.Project = {
      name: projectV2.name,
    };
    if (projectV2.clonePath) {
      devfileV1Project.clonePath = projectV2.clonePath;
    }

    if (projectV2.git) {
      devfileV1Project.source = this.projectInfoToProjectSource(projectV2, projectV2.git);
    } else if (projectV2.zip) {
      devfileV1Project.source = {
        type: 'zip',
        location: projectV2.zip.location,
      };
    }

    return devfileV1Project;
  }

  inlineCheTheiaPluginsYamlFromComponentsV1(
    devfilev1Components: che.workspace.devfile.Component[]
  ): string | undefined {
    if (!devfilev1Components) {
      return undefined;
    }
    // first, search any plugin components
    const chePluginComponents = devfilev1Components.filter(component => component.type === 'chePlugin');
    if (chePluginComponents.length === 0) {
      return undefined;
    }

    const cheTheiaPluginsContent = chePluginComponents.map(chePluginComponent => {
      const cheTheiaPlugin: any = {};
      if (chePluginComponent.id) {
        cheTheiaPlugin.id = chePluginComponent.id;
      }
      if (chePluginComponent.reference) {
        cheTheiaPlugin.reference = chePluginComponent.reference;
      }

      cheTheiaPlugin.override = {
        sidecar: {},
      };
      if (chePluginComponent.registryUrl) {
        cheTheiaPlugin.registryUrl = chePluginComponent.registryUrl;
      }

      if (chePluginComponent.alias) {
        cheTheiaPlugin.override.sidecar.name = chePluginComponent.alias;
      }

      if (chePluginComponent.env) {
        cheTheiaPlugin.override.sidecar.env = chePluginComponent.env;
      }

      if (chePluginComponent.preferences) {
        cheTheiaPlugin.override.preferences = chePluginComponent.preferences;
      }

      if (chePluginComponent.memoryLimit) {
        cheTheiaPlugin.override.sidecar.memoryLimit = chePluginComponent.memoryLimit;
      }
      if (chePluginComponent.memoryRequest) {
        cheTheiaPlugin.override.sidecar.memoryRequest = chePluginComponent.memoryRequest;
      }
      if (chePluginComponent.cpuLimit) {
        cheTheiaPlugin.override.sidecar.cpuLimit = chePluginComponent.cpuLimit;
      }
      if (chePluginComponent.cpuRequest) {
        cheTheiaPlugin.override.sidecar.cpuRequest = chePluginComponent.cpuRequest;
      }
      return cheTheiaPlugin;
    });

    return jsYaml.dump(cheTheiaPluginsContent);
  }

  inlineCheEditorYamlFromComponentsV1(devfilev1Components: che.workspace.devfile.Component[]): string | undefined {
    if (!devfilev1Components) {
      return undefined;
    }
    // first, search any plugin components
    const cheEditorComponents = devfilev1Components.filter(component => component.type === 'cheEditor');
    if (cheEditorComponents.length === 0) {
      return undefined;
    } else if (cheEditorComponents.length > 1) {
      throw new Error('Only one editor component is supported');
    }
    const cheEditorComponentV1 = cheEditorComponents[0];

    const cheEditorYaml: any = {};
    if (cheEditorComponentV1.id) {
      cheEditorYaml.id = cheEditorComponentV1.id;
    }
    if (cheEditorComponentV1.reference) {
      cheEditorYaml.reference = cheEditorComponentV1.reference;
    }

    if (cheEditorComponentV1.registryUrl) {
      cheEditorYaml.registryUrl = cheEditorComponentV1.registryUrl;
    }

    return jsYaml.dump(cheEditorYaml);
  }

  inlineVsCodeExtensionFromComponentsV1(devfilev1Components: che.workspace.devfile.Component[]): string | undefined {
    if (!devfilev1Components) {
      return undefined;
    }
    // first, search any plugin components
    const chePluginComponents = devfilev1Components.filter(component => component.type === 'chePlugin');
    if (chePluginComponents.length === 0) {
      return undefined;
    }

    const pluginIds = chePluginComponents
      .map(chePluginComponent => {
        if (chePluginComponent.id) {
          let filtered = chePluginComponent.id;
          if (filtered.endsWith('/latest')) {
            filtered = filtered.substring(0, filtered.length - '/latest'.length);
          }
          return filtered;
        }
        return undefined;
      })
      .filter(plugin => plugin);

    if (pluginIds) {
      const jsonObject = {
        recommendations: pluginIds,
      };
      return JSON.stringify(jsonObject, undefined, 2);
    }
  }

  async devfileV1toDevfileV2(devfileV1: che.workspace.devfile.Devfile): Promise<Devfile> {
    const devfileV2: Devfile = {
      schemaVersion: '2.1.0',
      metadata: this.metadataV1toMetadataV2(devfileV1.metadata),
      projects: (devfileV1.projects || []).map(project => this.projectV1toProjectV2(project)),
      components: (devfileV1.components || [])
        .map(component => this.componentV1toComponentV2(component))
        .filter(c => c),
      commands: (devfileV1.commands || []).map(command => this.commandV1toCommandV2(command)).filter(c => c),
    };

    devfileV2.attributes = {};

    // handle the ephemeral attribute
    if (
      devfileV1.attributes &&
      devfileV1.attributes.persistVolumes &&
      devfileV1.attributes.persistVolumes === 'false'
    ) {
      devfileV2.attributes['controller.devfile.io/storage-type'] = 'ephemeral';
    }

    // convert plugin components to inline che-theia-plugins.yaml content
    const inlineCheTheiaPluginsYaml = this.inlineCheTheiaPluginsYamlFromComponentsV1(devfileV1.components);
    if (inlineCheTheiaPluginsYaml) {
      devfileV2.attributes[this.CHE_THEIA_PLUGINS_YAML] = inlineCheTheiaPluginsYaml;
    }

    // convert plugin components to inline vscode-extension.json content
    const inlineVsCodeExtensionJson = this.inlineVsCodeExtensionFromComponentsV1(devfileV1.components);
    if (inlineVsCodeExtensionJson) {
      devfileV2.attributes[this.VSCODE_EXTENSIONS_JSON] = inlineVsCodeExtensionJson;
    }

    // convert editor component to inline che-editor.yaml content
    const inlineCheEditorYaml = this.inlineCheEditorYamlFromComponentsV1(devfileV1.components);
    if (inlineCheEditorYaml) {
      devfileV2.attributes[this.CHE_EDITOR_YAML] = inlineCheEditorYaml;
    }

    if (devfileV1.attributes) {
      Object.assign(devfileV2.metadata.attributes, {});
      Object.keys(devfileV1.attributes).forEach(attributeName => {
        devfileV2.metadata.attributes![attributeName] = devfileV1.attributes![attributeName];
      });
    }

    // inline launch
    const launchCommand = devfileV1.commands?.find(command => command.actions[0].type === 'vscode-launch');
    if (launchCommand) {
      devfileV2.attributes[this.VSCODE_LAUNCH_JSON] = launchCommand.actions[0].referenceContent;
    }

    // fix duplicated endpoints (same properties (name, port, etc..)
    await this.fixDuplicatedEndpoints(devfileV2);

    // process volumes
    await this.fixInvalidVolumeName(devfileV2);
    await this.processVolumesFromDevfileV2(devfileV2);

    let content = JSON.stringify(devfileV2);

    // update devfile v1 constants
    content = content.replace(/\$\(CHE_PROJECTS_ROOT\)/g, '$(PROJECTS_ROOT)');
    content = content.replace(/\$\{CHE_PROJECTS_ROOT\}/g, '${PROJECTS_ROOT}');
    return JSON.parse(content);
  }

  // if some endpoints have excactly the same value, remove duplicates
  async fixDuplicatedEndpoints(devfileV2: Devfile): Promise<void> {
    // grab endpoints
    const endpoints = devfileV2.components
      .filter(component => component.container)
      .map(component => component.container.endpoints)
      .flat();

    // remove duplicates
    const uniqueEndpoints = endpoints.filter((value, index) => {
      const _value = JSON.stringify(value);
      return (
        index ===
        endpoints.findIndex(obj => {
          return JSON.stringify(obj) === _value;
        })
      );
    });
    const uniqueEndpointsJson = uniqueEndpoints.map(endpoint => JSON.stringify(endpoint));
    const alreadyProcessedEndpoints: string[] = [];

    // ok now we'll iterate on endpoints and check if we need to replace endpoint if it's already been added
    devfileV2.components
      .filter(component => component.container)
      .forEach(component => {
        const endpoints = component.container.endpoints || [];

        var i = endpoints.length;
        while (i--) {
          const jsonEndpoint = JSON.stringify(endpoints[i]);
          if (uniqueEndpointsJson.includes(jsonEndpoint)) {
            // first time we see, we keep
            if (!alreadyProcessedEndpoints.includes(jsonEndpoint)) {
              alreadyProcessedEndpoints.push(jsonEndpoint);
            } else {
              // need to remove this endpoint
              endpoints.splice(i, 1);
            }
          }
        }
      });
  }

  // if some volume component are also components, update the name of the volume component
  // to be componentName-volume
  async fixInvalidVolumeName(devfileV2: Devfile): Promise<void> {
    // grab all container mountedVolumes
    const mountedVolumes = devfileV2.components
      .map(component => component.container)
      .filter(container => container)
      .map(container => container.volumeMounts)
      .reduce((acc, volumeMounts) => acc.concat(volumeMounts), [])
      .filter(volume => volume);
    const mountedVolumeNames = mountedVolumes.map(volume => volume.name);

    const allComponentExceptVolumeNames = devfileV2.components
      .filter(component => !component.volume)
      .map(component => component.name);

    // check the volume components that are also a 'component'
    const invalidVolumeNames = mountedVolumeNames.filter(componentName =>
      allComponentExceptVolumeNames.includes(componentName)
    );

    // we have duplicates, need to update the volume name
    mountedVolumes.forEach(volume => {
      if (invalidVolumeNames.includes(volume.name)) {
        volume.name = `${volume.name}-volume`;
      }
    });
  }

  // add missing volumes components when a volumeMount is defined in the devfile
  async processVolumesFromDevfileV2(devfileV2: Devfile): Promise<void> {
    // devfile has no undefined components, can be empty

    // grab all container mountedVolumes
    const mountedVolumes = devfileV2.components
      .map(component => component.container)
      .filter(container => container)
      .map(container => container.volumeMounts)
      .reduce((acc, volumeMounts) => acc.concat(volumeMounts), [])
      .filter(volume => volume);
    const mountedVolumeNames = mountedVolumes.map(volume => volume.name);

    // grab all components that are volumes
    const allComponentVolumeNames = devfileV2.components
      .filter(component => component.volume)
      .map(component => component.name);

    // check the mounted volumes that are not in existing components
    // use a set to avoid any duplicates
    const missingVolumes = Array.from(
      new Set(mountedVolumeNames.filter(volumeName => !allComponentVolumeNames.includes(volumeName)))
    );
    // add missing volumes
    missingVolumes.forEach(volumeName => {
      devfileV2.components.push({
        name: volumeName,
        volume: {},
      });
    });
  }

  async processPluginsAndEditorsFromDevfileV2(
    devfileV2: Devfile,
    devfileV1: che.workspace.devfile.Devfile,
    externalContentAccess?: (filename: string) => Promise<string>
  ): Promise<void> {
    // add plug-in component from che-theia-plugins.yaml file or .vscode/extensions.json file or from inline content
    let vsCodeExtensionJsonContent = '';
    let vsCodeLaunchJsonContent = '';
    let cheTheiaPluginsYamlContent = '';
    let cheEditorYamlContent = '';

    if (externalContentAccess) {
      // do we have external che-theia-plugins.yaml file or .vscode/extensions.json file
      const externalVSCodeExtensionJsonContent = await externalContentAccess(this.VSCODE_EXTENSIONS_JSON);
      if (externalVSCodeExtensionJsonContent) {
        vsCodeExtensionJsonContent = externalVSCodeExtensionJsonContent;
      }

      const externalVSCodeLaunchJsonContent = await externalContentAccess(this.VSCODE_LAUNCH_JSON);
      if (externalVSCodeLaunchJsonContent) {
        vsCodeLaunchJsonContent = externalVSCodeLaunchJsonContent;
      }

      const externalCheTheiaPluginsYamlContent = await externalContentAccess(this.CHE_THEIA_PLUGINS_YAML);
      if (externalCheTheiaPluginsYamlContent) {
        cheTheiaPluginsYamlContent = externalCheTheiaPluginsYamlContent;
      }
      const externalCheEditorYamlContent = await externalContentAccess(this.CHE_EDITOR_YAML);
      if (externalCheEditorYamlContent) {
        cheEditorYamlContent = externalCheEditorYamlContent;
      }
    }

    // inline content ?
    if (devfileV2.attributes) {
      if (devfileV2.attributes[this.VSCODE_EXTENSIONS_JSON]) {
        vsCodeExtensionJsonContent = devfileV2.attributes[this.VSCODE_EXTENSIONS_JSON];
      }
      if (devfileV2.attributes[this.VSCODE_LAUNCH_JSON]) {
        vsCodeLaunchJsonContent = devfileV2.attributes[this.VSCODE_LAUNCH_JSON];
      }
      if (devfileV2.attributes[this.CHE_THEIA_PLUGINS_YAML]) {
        cheTheiaPluginsYamlContent = devfileV2.attributes[this.CHE_THEIA_PLUGINS_YAML];
      }
      if (devfileV2.attributes[this.CHE_EDITOR_YAML]) {
        cheEditorYamlContent = devfileV2.attributes[this.CHE_EDITOR_YAML];
      }
    }

    // ok now apply the vscode extension.json content
    if (vsCodeExtensionJsonContent && vsCodeExtensionJsonContent !== '') {
      const strippedContent = jsoncparser.stripComments(vsCodeExtensionJsonContent);
      const vsCodeExtensionJson = jsoncparser.parse(strippedContent);
      // for each plugin, add a component
      vsCodeExtensionJson.recommendations.forEach(recommendation => {
        devfileV1.components.push({
          id: `${recommendation.replace(/\./g, '/')}/latest`,
          type: 'chePlugin',
        });
      });
    }

    // ok now apply the vscode launch.json content
    if (vsCodeLaunchJsonContent && vsCodeLaunchJsonContent !== '') {
      const strippedContent = jsoncparser.stripComments(vsCodeLaunchJsonContent);
      const vsCodeLaunchJson = jsoncparser.parse(strippedContent);
      const command = {
        name: vsCodeLaunchJson.configurations[0].name,
        actions: [
          {
            type: 'vscode-launch',
            referenceContent: vsCodeLaunchJsonContent,
          },
        ],
      };

      // add a command
      devfileV1.commands.push(command);
    }

    // ok now apply the cheTheiaPlugins Content
    if (cheTheiaPluginsYamlContent && cheTheiaPluginsYamlContent !== '') {
      const cheTheiaPluginsYaml = jsYaml.load(cheTheiaPluginsYamlContent);
      if (Array.isArray(cheTheiaPluginsYaml)) {
        // build components
        const components = cheTheiaPluginsYaml.map(component => {
          const v1component: che.workspace.devfile.Component = {
            type: 'chePlugin',
          };
          if (component.id) {
            v1component.id = component.id;
          }
          if (component.reference) {
            v1component.reference = component.reference;
          }
          if (component.registryUrl) {
            v1component.registryUrl = component.registryUrl;
          }
          if (component.override && component.override.sidecar) {
            if (component.override.sidecar.memoryLimit) {
              v1component.memoryLimit = component.override.sidecar.memoryLimit;
            }
            if (component.override.sidecar.memoryRequest) {
              v1component.memoryRequest = component.override.sidecar.memoryRequest;
            }
            if (component.override.sidecar.cpuLimit) {
              v1component.cpuLimit = component.override.sidecar.cpuLimit;
            }
            if (component.override.sidecar.cpuRequest) {
              v1component.cpuRequest = component.override.sidecar.cpuRequest;
            }
            if (component.override.sidecar.env) {
              v1component.env = component.override.sidecar.env;
            }
            if (component.override.preferences) {
              v1component.preferences = component.override.preferences;
            }
            if (component.override.sidecar.name) {
              v1component.alias = component.override.sidecar.name;
            }
          }
          return v1component;
        });

        // now, override or add any existing component
        components.forEach(component => {
          // existing component ?
          const existing = devfileV1.components.find(
            devfileV1Component => devfileV1Component.type === 'chePlugin' && devfileV1Component.id === component.id
          );
          if (existing) {
            Object.assign(existing, component);
          } else {
            devfileV1.components.push(component);
          }
        });
      }
    }

    // ok now apply the cheEditor Content
    if (cheEditorYamlContent && cheEditorYamlContent !== '') {
      const cheEditorYaml = jsYaml.load(cheEditorYamlContent);
      if (cheEditorYaml) {
        const v1component: che.workspace.devfile.Component = {
          type: 'cheEditor',
        };
        if (cheEditorYaml.id) {
          v1component.id = cheEditorYaml.id;
        }
        if (cheEditorYaml.reference) {
          v1component.reference = cheEditorYaml.reference;
        }
        if (cheEditorYaml.registryUrl) {
          v1component.registryUrl = cheEditorYaml.registryUrl;
        }

        devfileV1.components.push(v1component);
      }
    }
  }

  findFirstProjectPath(devfileV1: che.workspace.devfile.Devfile): string | undefined {
    const projects = devfileV1.projects;
    if (!projects || projects.length === 0) {
      return undefined;
    }

    // take first project
    const project = projects[0];
    let path;
    if (project.clonePath) {
      path = `\${CHE_PROJECTS_ROOT}/${project.clonePath}`;
    } else {
      path = `\${CHE_PROJECTS_ROOT}/${project.name}`;
    }
    return path;
  }

  prunePlaceHolderComponents(devfileV1: che.workspace.devfile.Devfile) {
    devfileV1.components = devfileV1.components.filter(
      component => component.image !== 'buildguidanceimage-placeholder'
    );
  }

  fixNightlyImages(devfileV1: che.workspace.devfile.Devfile) {
    devfileV1.components.forEach(component => {
      if (component.image && component.image === 'quay.io/eclipse/che-quarkus:nightly') {
        component.image = 'quay.io/eclipse/che-quarkus:next';
      } else if (component.image && component.image === 'quay.io/eclipse/che-java11-maven:nightly') {
        component.image = 'quay.io/eclipse/che-java11-maven:next';
      }
    });
  }

  // Apply 1Gi on all components without memoryLimit
  fixMemoryLimit(devfileV1: che.workspace.devfile.Devfile) {
    devfileV1.components.forEach(component => {
      if (component.type === 'dockerimage' && !component.memoryLimit) {
        component.memoryLimit = '1Gi';
      }
    });
  }

  async processDefaultWorkDirCommands(devfileV1: che.workspace.devfile.Devfile, path: string): Promise<void> {
    // grab commands without workdir or with workingdir being the parent
    const execWithoutWorkingdir = devfileV1.commands
      .filter(
        command =>
          command.actions &&
          command.actions.find(
            action =>
              (!action.workdir || action.workdir === '$PROJECTS_ROOT' || action.workdir === '${PROJECTS_ROOT}') &&
              action.type === 'exec'
          )
      )
      .map(command => command.actions)
      .flat();

    // update working directory
    if (execWithoutWorkingdir.length > 0 && path) {
      // set the working directory to the project directory
      execWithoutWorkingdir.forEach(exec => (exec.workdir = path));
    }
  }

  async devfileV2toDevfileV1(
    devfileV2: Devfile,
    externalContentAccess?: (filename: string) => Promise<string>
  ): Promise<che.workspace.devfile.Devfile> {
    const devfileV1: che.workspace.devfile.Devfile = {
      apiVersion: '1.0.0',
      metadata: this.metadataV2toMetadataV1(devfileV2.metadata),
      projects: (devfileV2.projects || []).map(project => this.projectV2toProjectV1(project)),
      components: (devfileV2.components || [])
        .map(component => this.componentV2toComponentV1(component))
        .filter(c => c),
      commands: (devfileV2.commands || []).map(command => this.commandV2toCommandV1(command)).filter(c => c),
    };

    if (devfileV2.metadata.attributes) {
      const attributeKeys = Object.keys(devfileV2.metadata.attributes);
      if (attributeKeys.length > 0) {
        const attributes = devfileV1.attributes || {};
        attributeKeys.forEach(attributeName => {
          attributes[attributeName] = devfileV2.metadata.attributes![attributeName];
        });
        if (Object.keys(attributes).length > 0) {
          devfileV1.attributes = attributes;
        }
      }
    }

    // process plugins and editors
    await this.processPluginsAndEditorsFromDevfileV2(devfileV2, devfileV1, externalContentAccess);

    const firstProjectPath = this.findFirstProjectPath(devfileV1);

    // update workDir of commands to be inside the current project if missing
    await this.processDefaultWorkDirCommands(devfileV1, firstProjectPath);

    // prune placeholder components
    this.prunePlaceHolderComponents(devfileV1);

    // fix nightly images of che
    this.fixNightlyImages(devfileV1);

    // memoryLimit is a mandatory attribute in devfile v1
    this.fixMemoryLimit(devfileV1);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const devfileV1Any = devfileV1 as any;

    if (devfileV1.components && devfileV1.components.length === 0) {
      delete devfileV1Any.components;
    }

    if (devfileV1.projects && devfileV1.projects.length === 0) {
      delete devfileV1Any.projects;
    }

    if (devfileV1.commands && devfileV1.commands.length === 0) {
      delete devfileV1Any.commands;
    }

    // cleanup attributes that are not string
    if (devfileV1.attributes) {
      Object.keys(devfileV1.attributes).forEach(key => {
        if (typeof devfileV1.attributes[key] !== 'string') {
          delete devfileV1.attributes[key];
        }
      });
    }

    if (devfileV1.attributes && Object.keys(devfileV1.attributes).length === 0) {
      delete devfileV1Any.attributes;
    }

    let content = JSON.stringify(devfileV1, undefined, 2);

    // update devfile v2 constants
    content = content.replace(/\$\(PROJECTS_ROOT\)/g, '$(CHE_PROJECTS_ROOT)');
    content = content.replace(/\$\{PROJECTS_ROOT\}/g, '${CHE_PROJECTS_ROOT}');
    if (firstProjectPath) {
      content = content.replace(/\$\{PROJECT_SOURCE\}/g, firstProjectPath);
    }
    return JSON.parse(content);
  }
}
