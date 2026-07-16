const bcrypt = require("bcryptjs");

async function run() {

    const hash = await bcrypt.hash("kar123", 10);

    console.log(hash);

}

run();