const mongoose = require('mongoose');
const PassedStudent = require('./backend/models/PassedStudent');

async function check() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ssism');
        const rollDup = await PassedStudent.aggregate([
            { $group: { _id: '$rollNumber', count: { $sum: 1 }, ids: { $push: '$_id' } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        const serialDup = await PassedStudent.aggregate([
            { $group: { _id: '$serialNumber', count: { $sum: 1 }, ids: { $push: '$_id' } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        console.log('Duplicate Roll Numbers:', JSON.stringify(rollDup, null, 2));
        console.log('Duplicate Serial Numbers:', JSON.stringify(serialDup, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}
check();
