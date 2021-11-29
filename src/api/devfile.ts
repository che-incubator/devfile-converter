import { V220Devfile } from '@devfile/api';

import { V220DevfileMetadata } from '@devfile/api';

export type DevfileMetadataLike = V220DevfileMetadata & {};

export type DevfileMetadata = DevfileMetadataLike & Required<Pick<DevfileMetadataLike, 'name'>>;

export type DevfileLike = V220Devfile & {
  metadata?: DevfileMetadataLike;
};

export type Devfile = DevfileLike &
  Required<Pick<DevfileLike, 'metadata'>> & {
    metadata?: DevfileMetadata;
  };
