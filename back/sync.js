const db = require( './models' )

;( async() => {
  await db.sequelize.sync({ alter: true })
  console.log( 'done' )
  process.exit()
} )()
