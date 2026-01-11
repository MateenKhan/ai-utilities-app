const bcrypt = require('bcryptjs');

async function generateHash() {
    const password = 'test';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password:', password);
    console.log('Bcrypt Hash:', hash);
    console.log('\nUse this hash in your DML script:');
    console.log(`'${hash}'`);
}

generateHash();
