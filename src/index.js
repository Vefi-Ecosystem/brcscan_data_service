const express = require('express');
const app = express();
const port = parseInt(process.env.PORT || '8006');
const { redisBlocksKey, redisTokensKey, redisTransactionsKey } = require('./constants');
const { initConnection, getAllKeysMatchingPattern, getItem, checkIfItemExists } = require('./utils/redis');

const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    message: 'Hello there!'
  });
});

router.get('/blocks', async (req, res) => {
  try {
    const blocksKeyExists = await checkIfItemExists(redisBlocksKey);
    let result = blocksKeyExists ? JSON.parse((await getItem(redisBlocksKey))) : [];
    result = result.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    result = {
      items: req.query.page
        ? result.slice(
            result.length > 25 ? (parseInt(req.query.page) - 1) * 25 - result.length : 0,
            result.length > 25 ? parseInt(req.query.page) * 25 - result.length : result.length
          )
        : result.slice(result.length > 25 ? result.length - 25 : 0, result.length),
      size: result.length
    };
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const transactionsKeyExists = await checkIfItemExists(redisTransactionsKey);
    let result = transactionsKeyExists ? JSON.parse((await getItem(redisTransactionsKey))) : [];
    result = result.sort((a, b) => parseInt(a.blockNumber) - parseInt(b.blockNumber));
    result = {
      items: req.query.page
        ? result.slice(
            result.length > 25 ? (parseInt(req.query.page) - 1) * 25 - result.length : 0,
            result.length > 25 ? parseInt(req.query.page) * 25 - result.length : result.length
          )
        : result.slice(result.length > 25 ? result.length - 25 : 0, result.length),
      size: result.length
    };
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/transactions/:address', async (req, res) => {
  try {
    const transactionsKeyExists = await checkIfItemExists(redisTransactionsKey);
    let result = transactionsKeyExists ? JSON.parse((await getItem(redisTransactionsKey))) : [];

    result = result
      .filter(
        (txn) =>
          txn.from?.toLowerCase() === req.params.address.toLowerCase() ||
          txn.to?.toLowerCase() === req.params.address.toLowerCase()
      )
      .sort((a, b) => parseInt(b.blockNumber) - parseInt(a.blockNumber));

    result = {
      items: req.query.page
        ? result.slice(
            result.length > 25 ? (parseInt(req.query.page) - 1) * 25 - result.length : 0,
            result.length > 25 ? parseInt(req.query.page) * 25 - result.length : result.length
          )
        : result.slice(result.length > 25 ? result.length - 25 : 0, result.length),
      size: result.length
    };
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/tokens', async (req, res) => {
  try {
    const allRedisKeys = await getAllKeysMatchingPattern(redisTokensKey);
    let result = [];

    for (const key of allRedisKeys) {
      const token = await getItem(key);
      result = [...result, JSON.parse(token)];
    }

    result = {
      items: req.query.page
        ? result.slice(
            result.length > 25 ? (parseInt(req.query.page) - 1) * 25 - result.length : 0,
            result.length > 25 ? parseInt(req.query.page) * 25 - result.length : result.length
          )
        : result.slice(result.length > 25 ? result.length - 25 : 0, result.length),
      size: result.length
    };
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get('/addresses/count', async (req, res) => {
  try {
    const transactionsKeyExists = await checkIfItemExists(redisTransactionsKey);
    let result = transactionsKeyExists ? JSON.parse((await getItem(redisTransactionsKey))) : [];
    result = result.map((txn) => txn.to);
    result = new Set(result);
    result = result.size;
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(require('morgan')('combined'));
app.use('/', router);

app.listen(port, async () => {
  console.log('App running on %d', port);
  await initConnection();
});