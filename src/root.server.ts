/* eslint-disable no-console */
import './moduleAlias';
import connectDatabase from '@db/dataBase';

import { app } from './root.app';

const PORT = process.env.PORT || 4000;

connectDatabase()
  .then(() => {
    app.on('error', error => {
      console.log('HTTPS server error:', error);
      process.exit(1);
    });

    app.listen(PORT, () => {
      console.log(`Server is running at https://localhost:${PORT}`);
    });
  })
  .catch(error => {
    console.log('MongoDB connection failed', error);
    process.exit(1); // Exit the process if MongoDB connection fails
  });
