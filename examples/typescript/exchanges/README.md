# Integrating with an exchange

[![License](https://img.shields.io/badge/License-LGPL%203.0%20only-blue.svg)][license]
[![Discord](https://img.shields.io/badge/chat-on%20discord-green.svg)][discord]

This document is intended to **guide developers** and **system integrators** through the integration of the *native* `DHP` token into an Exchange platform. It contains recommendations on how to set up accounts, listen for deposits, and create withdrawals as well as code examples ready to be adopted.

Please, follow our documentation: https://docs.dhealth.com/docs/integrating-with-an-exchange

**NOTE**: The author(s) and contributor(s) of this package cannot be held responsible for any loss of money or for any malintentioned usage forms of this package. Please use this package with caution.

## Disclaimer

A few notes on this example program:

**CAUTION**: It uses a fake DBService object that simulates the Exchange database. Calls to this object should obviously be replaced by the actual Exchange infrastructure in production code. For simplicity these calls are synchronous but they could be executed asynchronously too.

**CAUTION**: No error handling is performed at all. Use mechanisms like try {} catch where appropriate in production code.

**CAUTION**: Finally, besides the snippets shown in the guide, the complete program also contains auxiliary code (like polling loops) in order to make it runnable and self-sufficient. This auxiliary code is not meant to be used as an inspiration at all, it is just there for convenience.

## Getting help

Use the following available resources to get help:

- [dHealth Documentation][docs]
- Join the community on [Discord][discord]

## License

Copyright 2022-present [dHealth Network][parent-url], All rights reserved.

Licensed under the [LGPL v3.0](LICENSE)

[license]: https://opensource.org/licenses/LGPL-3.0
[parent-url]: https://dhealth.com
[docs]: https://docs.dhealth.com
[discord]: https://discord.gg/P57WHbmZjk

