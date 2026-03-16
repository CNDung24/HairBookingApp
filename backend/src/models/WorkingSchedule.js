const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WorkingSchedule = sequelize.define('WorkingSchedule', {
    dayOfWeek: { 
        type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
        allowNull: false
    },
    startTime: { type: DataTypes.STRING, allowNull: false }, // "09:00"
    endTime: { type: DataTypes.STRING, allowNull: false }, // "18:00"
    isWorking: { type: DataTypes.BOOLEAN, defaultValue: true },
    breakStart: { type: DataTypes.STRING }, // "12:00"
    breakEnd: { type: DataTypes.STRING }, // "13:00"
    specificDate: { type: DataTypes.DATEONLY }, // cho ngày cụ thể (optional)
    isOff: { type: DataTypes.BOOLEAN, defaultValue: false }, // nghỉ phép
    offReason: { type: DataTypes.STRING }
});

module.exports = WorkingSchedule;
