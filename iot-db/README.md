# IoT - DB

### Usage

```js
const setupDatabase = require("iot-db");

setupDataBase(config)
  .then((db) => {
    const { Agent, Metric } = db;
  })
  .catch((err) => console.error(err));
```
