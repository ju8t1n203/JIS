const express = require('express');
const app = express();

app.use(express.static('public'));
app.use(express.json({limit: '15mb'})); //limit for image size in MySQL is 16MB

const os = require('os');

const interfaces = os.networkInterfaces();
const address =
  Object.values(interfaces)
    .flat()
    .find(info => info.family === 'IPv4' && !info.internal)?.address || 'localhost';

app.listen(3000, () => console.log(`Server running on http://${address}:3000`));

//TODO
// test photo upload types, what can/cannot be retrieved from the db after upload
// finish all basic functionality
// make support for embedded items
// multiple item locations
// users (admin, user)
//// user permissions
// modularization

//--- PAGES ---
//SEARCH
//////fine tune button functionality
//CONSUME
//RESTOCK
//////fine tune listbox display
//ADD/REMOVE
//////add labels for textboxes
//EDIT
//////ITEM-database wiring/api
//////add labels for textboxes
//PICK LIST
//////NEED TO START

//This sets up the MySQL connection pool
//pool is used to manage multiple connections efficiently
//allows for multiple requests to be handled concurrently without creating a new connection each time
const mysql = require('mysql2');
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'admin',
  password: 'rapidxc123',
  database: 'jis',
});

module.exports = pool;

pool.query('SELECT 1', (err, results) => {
  if (err) return console.error('Connection failed:', err.message);
  console.log('✅ Connected to the MySQL server (via pool).');
});

//searchs the jis database for a table with the name provided in the request body
app.post('/api/check-table', (req, res) => {
  const { tableName } = req.body;
  if (!tableName) return res.status(400).json({ exists: false, error: 'No table name provided' });

  pool.query(
    'SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?',
    ['jis', tableName],
    (err, results) => {
      if (err) return res.status(500).json({ exists: false, error: err.message });
      res.json({ exists: results[0].count > 0 });
    }
  );
});

//checks if a location (site, room, area, or specifier) exists in the database
//can search on any layer of the hierarchy
app.post('/api/check-location', (req, res) => {
  const { type, name, parentId } = req.body;
  if (!type || !name) {
    return res.status(400).json({ exists: false, error: 'Missing type or name.' });
  }

  let sql, params;
  if (type === 'site') {
    sql = 'SELECT COUNT(*) AS count FROM site WHERE site_name = ?';
    params = [name];
  } else if (type === 'room') {
    sql = 'SELECT COUNT(*) AS count FROM room WHERE site_id = ? AND room_name = ?';
    params = [parentId, name];
  } else if (type === 'area') {
    sql = 'SELECT COUNT(*) AS count FROM area WHERE room_id = ? AND area_name = ?';
    params = [parentId, name];
  } else if (type === 'specifier') {
    sql = 'SELECT COUNT(*) AS count FROM specifier WHERE area_id = ? AND specifier_name = ?';
    params = [parentId, name];
  } else {
    return res.status(400).json({ exists: false, error: 'Invalid type.' });
  }

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('Error in /api/check-location:', err);
      return res.status(500).json({ exists: false, error: err.message });
    }
    res.json({ exists: results[0].count > 0 });
  });
});

//adds a new location (site, room, area, or specifier) to the database
//requires the type of location, name, and parentId (if applicable) (parentId from the HTML would be the name of the parent layer)
app.post('/api/add-location', (req, res) => {
  const { type, name, parentId } = req.body;
  if (!type || !name) {
    return res.json({ success: false, message: 'Missing required fields.' });
  }

  let sql, params;
  if (type === 'site') {
    sql = 'INSERT INTO site (site_name) VALUES (?)';
    params = [name];
  } else if (type === 'room') {
    sql = 'INSERT INTO room (site_id, room_name) VALUES (?, ?)';
    params = [parentId, name];
  } else if (type === 'area') {
    sql = 'INSERT INTO area (room_id, area_name) VALUES (?, ?)';
    params = [parentId, name];
  } else if (type === 'specifier') {
    sql = 'INSERT INTO specifier (area_id, specifier_name) VALUES (?, ?)';
    params = [parentId, name];
  } else {
    return res.json({ success: false, message: 'Invalid type.' });
  }

  pool.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error adding location:', err);
      return res.json({ success: false, message: err.message });
    }
    res.json({ success: true });
  });
});

//deletes a location (site, room, area, or specifier) from the database
//requires the type of location, name, and parentId (if applicable) (parentId from the HTML would be the name of the parent layer)
app.post('/api/delete-location', (req, res) => {
  const { type, name, parentId } = req.body;
  if (!type || !name) {
    return res.json({ success: false, message: 'Missing required fields.' });
  }

  let sql, params;
  if (type === 'site') {
    sql = 'DELETE FROM site WHERE site_name = ?';
    params = [name];
  } else if (type === 'room') {
    sql = 'DELETE FROM room WHERE site_id = ? AND room_name = ?';
    params = [parentId, name];
  } else if (type === 'area') {
    sql = 'DELETE FROM area WHERE room_id = ? AND area_name = ?';
    params = [parentId, name];
  } else if (type === 'specifier') {
    sql = 'DELETE FROM specifier WHERE area_id = ? AND specifier_name = ?';
    params = [parentId, name];
  } else {
    return res.json({ success: false, message: 'Invalid type.' });
  }

  pool.query(sql, params, (err, result) => {
    if (err) {
      console.error('Error deleting location:', err);
      return res.json({ success: false, message: err.message });
    }
    res.json({ success: true });
  });
});

//retreives all sites
app.get('/api/sites', (req, res) => {
  pool.query('SELECT site_name FROM site', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//retreives the rooms for a site by site_name
app.get('/api/rooms', (req, res) => {
  const { site_name } = req.query;
  pool.query('SELECT room_name FROM room WHERE site_id = (SELECT site_id FROM site WHERE site_name = ?)', [site_name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//retreives the areas for a room by room_name
app.get('/api/areas', (req, res) => {
  const { room_name } = req.query;
  pool.query('SELECT area_name FROM area WHERE room_id = (SELECT room_id FROM room WHERE room_name = ?)', [room_name], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//retreives the specifiers for an area by area_name
app.get('/api/specifiers', (req, res) => {
  const { area_name } = req.query;
  pool.query('SELECT specifier_name FROM specifier WHERE area_id = (SELECT area_id FROM area WHERE area_name = ?)',
    [area_name],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

//get site_id by site_name
//retreives the parent site_id for a room, area, or specifier
app.get('/api/site-id', (req, res) => {
  const { site_name } = req.query;
  pool.query('SELECT site_id FROM site WHERE site_name = ?', [site_name], (err, results) => {
    if (err || results.length === 0) return res.json({ id: null });
    res.json({ id: results[0].site_id });
  });
});

//get room_id by room_name
//retreives the parent room_id for a room, area, or specifier
app.get('/api/room-id', (req, res) => {
  const { room_name } = req.query;
  pool.query('SELECT room_id FROM room WHERE room_name = ?', [room_name], (err, results) => {
    if (err || results.length === 0) return res.json({ id: null });
    res.json({ id: results[0].room_id });
  });
});

//get area_id by area_name
//retreives the parent area_id for a room, area, or specifier
app.get('/api/area-id', (req, res) => {
  const { area_name } = req.query;
  pool.query('SELECT area_id FROM area WHERE area_name = ?', [area_name], (err, results) => {
    if (err || results.length === 0) return res.json({ id: null });
    res.json({ id: results[0].area_id });
  });
});

//populates a picturebox with an items photo retrieved from the database as a blob
app.get('/api/item-photo', (req, res) => {
  const { barcode } = req.query;
  const dbInfo = {
    host: pool.config.connectionConfig.host,
    port: pool.config.connectionConfig.port,
    database: pool.config.connectionConfig.database,
    table: 'item',
    column: 'photo',
    barcode: barcode
  };
  pool.query('SELECT photo FROM item WHERE item_barcode = ?', [barcode], (err, results) => {
    if (err || results.length === 0 || !results[0].photo) {
      //photo not found try default
        pool.query('SELECT photo FROM item WHERE item_barcode = ?',['12345'], (err2, results2) => {
          if (err2 || results2.length === 0 || !results2[0].photo) {
            //send detailed error
            return res.status(404).json({
              error: 'No image found for this item or default.',
              dbInfo
            });
          }
          res.set('Content-Type', 'image/jpeg');
          res.set('Cache-Control', 'no-store');
          res.send(results2[0].photo);
        });
      return;
    }
    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'no-store');
    res.send(results[0].photo);
  });
});

//checks item table to check if an item with an existing barcode or name exists
app.get('/api/item-exists', (req, res) => {
    const { barcode, name } = req.query;
    pool.query(
        'SELECT item_barcode, item_name FROM item WHERE item_barcode = ? OR item_name = ?',
        [barcode, name],
        (err, results) => {
            if (err) return res.status(500).json({ exists: false, error: err.message });
            let match = { barcode: false, name: false };
            results.forEach(row => {
                if (row.item_barcode === barcode) match.barcode = true;
                if (row.item_name === name) match.name = true;
            });
            res.json({ exists: results.length > 0, match });
        }
    );
});

//retrieves full item row by barcode
app.get('/api/get-item', (req, res) => {
    const { barcode } = req.query;
    if (!barcode) return res.status(400).json({ error: 'Barcode is required.' });
    pool.query(
        'SELECT * FROM item WHERE item_barcode = ?',
        [barcode],
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            if (results.length === 0) return res.status(404).json({ error: 'Item not found.' });
            res.json(results[0]);
        }
    );
});

//add item
app.post('/api/add-item', (req, res) => {
  console.log('▶ req.body:', req.body);
  const {barcode, name, quantity, amount = 5, location, descriptio, category, photo = null, embedded = 0, embedded_barcodes = null} = req.body;

  const query = `INSERT INTO item (item_barcode, item_name, quantity, restock_amount, location, descriptio, category, photo, embedded, embedded_barcodes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const photoBuffer = photo ? Buffer.from(photo, 'base64') : null;
  const values = [barcode, name, quantity, amount, location, descriptio, category, photoBuffer, embedded, embedded_barcodes];

  const placeholderCount = (query.match(/\?/g) || []).length; //no clue as to why but there was a count mis-match error being thrown on fetch until this "log" was added
  console.log('🔢 columns list:', query
    .split('VALUES')[0]
    .match(/\(([^)]+)\)/)[1]
    .split(',')
    .map(c => c.trim())
  );
  console.log('🔢 placeholder count:', placeholderCount);
  console.log('🔢 values count:', values.length);
  console.log('🔢 values array:', values);

  pool.query(query, values, (err, result) => {
    if (err) {
      console.error('❌ Database Insert Error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, insertedId: result.insertId || null });
  });
});

//remove item
app.delete('/api/delete-item', (req, res) => {
    const { barcode } = req.body;
    pool.query(
        'DELETE FROM item WHERE item_barcode = ?',
        [barcode],
        (err, result) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: result.affectedRows > 0 });
        }
    );
});

//searches categories in the database by name
app.get('/api/category-exists', (req, res) => {
    const { name } = req.query;

    console.log('Received query param:', name);

    pool.query(
        'SELECT COUNT(*) AS count FROM category WHERE category_name = ?',
        [name],
        (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ exists: false });
            }

            const exists = results[0].count > 0;
            res.json({ exists });
        }
    );
});

//adds the category to the database
app.post('/api/add-category', (req, res) => {
    const { name } = req.body;
    pool.query('INSERT INTO category (category_name) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.error('Error inserting category:', err); // Logs full error details
            return res.json({ success: false, error: 'Database error occurred' });
        }
        res.json({ success: true });
    });
});


//deletes the category to the database
app.delete('/api/delete-category', (req, res) => {
    const { name } = req.body;
    console.log('Attempting to delete category:', name);

    pool.query(
        'DELETE FROM category WHERE category_name = ?',
        [name],
        (err, result) => {
            if (err) {
                console.error('Delete error:', err);
                return res.json({ success: false });
            }

            console.log('Delete result:', result);
            res.json({ success: result.affectedRows > 0 });
        }
    );
});

//retreives all categories
app.get('/api/category', (req, res) => {
  pool.query('SELECT category_name FROM category', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

//searches the database for items by barcode
app.get("/search", (req, res) => {
  const q = req.query.q;
  const column = req.query.column;
  const filter = req.query.filter;

  const allowedColumns = [
    "item_barcode",
    "item_name",
    "descriptio"
  ];

  if (!allowedColumns.includes(column)) {
    return res.status(400).json({ error: "Invalid column name" });
  }

  if (!q) return res.json([]);

  let sql = `SELECT * FROM item WHERE ${column} LIKE ?`;
  let params = [`%${q}%`];

  if (filter) {
    const levelCount = filter.split('>').filter(Boolean).length;
    if (levelCount < 4) {
      sql += ' AND location LIKE ?';
      params.push(filter + '%');
    } else {
      sql += ' AND location = ?';
      params.push(filter);
    }
  }

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

//action log
app.post('/api/action-log', (req, res) => {
  const {barcode, action, oldQuantity, changeQuantity, newQuantity} = req.body;
  pool.query(
    'INSERT INTO log (item_barcode, action, old_qty, change_qty, new_qty) VALUES (?, ?, ?, ?, ?)',
    [barcode, action, oldQuantity, changeQuantity, newQuantity],
    (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true });
    }
  );
});

//updates item quantity for consuming/restocking
app.post('/api/update-quantity', (req, res) => {
  const { quantity, barcode } = req.body;
  pool.query(
    'UPDATE item SET quantity = ? WHERE item_barcode = ?',
    [quantity, barcode],
    (err, result) => {
      if (err) {
        console.error('Error updating quantity:', err);
        return res.status(500).json({ success: false, error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, error: 'Item not found.' });
      }

      res.json({ success: true, updated: { barcode, quantity } });
    }
  );
});

//searches the database for barcode and/or name matches for item editing
// excludes the item with the provided auto_id so items can retain the same barcode or name
app.get('/search-items', async (req, res) => {
  const { name, barcode, auto_id } = req.query;

  try {
    let query = `SELECT * FROM item WHERE auto_id != ? AND (${name ? 'item_name LIKE ?' : ''} ${name && barcode ? ' OR ' : ''} ${barcode ? 'item_barcode LIKE ?' : ''})`;

    // build parameter list dynamically
    const params = [auto_id];
    if (name) params.push(`%${name}%`);
    if (barcode) params.push(`%${barcode}%`);

    const [rows] = pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});
