# devfile-converter

This library allows to convert devfile v1 to devfile v2 or the opposite.




```typescript
import * as devfileConverter from '@eclipse-che/devfile-converter';
```


```typescript
async function v2ToV1(devfileV2: Devfile, externalContentAccess?: (filename: string) => Promise<string>): Promise<che.workspace.devfile.Devfile>
```

```typescript
async function v1ToV2(devfileV1: che.workspace.devfile.Devfile): Promise<Devfile>
```
