/**
 * This file is part of dHealth Documentation shared under LGPL-3.0
 * Copyright (C) 2022-present dHealth Network, All rights reserved.
 *
 * @package     dHealth Documentation
 * @subpackage  Typescript
 * @author      dHealth Network <devs@dhealth.foundation>
 * @license     LGPL-3.0
 */
import { Address, MosaicId, NamespaceId, NetworkType } from '@dhealth/sdk';

export interface ExchangeDHPConfig {
  apiUrl: string;
  networkType: NetworkType;
  networkGenerationHashSeed: string;
  centralAccountAddress: Address;
  tokenId: MosaicId;
  tokenAlias: NamespaceId;
  tokenDivisibility: number;
  requiredConfirmations: number;
}
