require('dotenv').config();
const { sequelize, Barber, Booking, User, Service, Shop } = require('./src/models');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('DB connected OK');
    
    console.log('--- Test: Booking.findAll ---');
    const bookings = await Booking.findAll({ where: { BarberId: 1 }, limit: 2 });
    console.log('Bookings found:', bookings.length);
    
    if (bookings.length > 0) {
      const u = await User.findByPk(bookings[0].UserId, { attributes: ['id', 'name', 'email', 'phone'] });
      console.log('User:', u ? u.name : null);
      const s = await Service.findByPk(bookings[0].ServiceId);
      console.log('Service:', s ? s.name : null);
    }
    
    console.log('ALL TESTS PASSED');
  } catch (err) {
    console.error('=== ERROR ===');
    console.error('Message:', err.message);
    console.error('SQL:', err.sql);
    console.error('Original:', err.original?.message);
  } finally {
    try { await sequelize.close(); } catch(e){}
    process.exit(0);
  }
}

test();
