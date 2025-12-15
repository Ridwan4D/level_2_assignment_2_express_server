import app from "./app";
import config from "./config";

//? listen server
app.listen(config.port, () => {
  console.log(`Example app listening on port ${config.port}`);
});
