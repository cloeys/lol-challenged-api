/* eslint-disable no-restricted-syntax */
const express = require('express');
const axios = require('axios');
const config = require('../firebase.config');
require('dotenv').config();

const router = express.Router();

function syncDelay(milliseconds) {
  const start = new Date().getTime();
  let end = 0;
  while ((end - start) < milliseconds) {
    end = new Date().getTime();
  }
}

async function addEntryToLeaderboard(
  region, challengeId, level, date, leaderboardEntry, summonerData
) {
  console.log(summonerData);
  await config.db
    .collection('leaderboard')
    .doc(region)
    .collection('challenges')
    .doc(challengeId.toString())
    .collection('level')
    .doc(level)
    .collection(date)
    .add({
      name: summonerData.name,
      profileIconId: summonerData.profileIconId,
      position: leaderboardEntry.position,
      value: leaderboardEntry.value
    });
  console.log(`Processed: ${summonerData.name}, position ${leaderboardEntry.position} with value ${leaderboardEntry.value}`);
}

router.get('/:region', async (req, res) => {
  const { region } = req.params;
  const levels = ['CHALLENGER', 'GRANDMASTER', 'MASTER']; // only valid levels
  const challenges = ['101101']; // get all challengeIds from firestore challenge config where leaderboard = true
  const date = new Date().toLocaleDateString().replaceAll('/', '-');

  try {
    for (const challengeId of challenges) {
      for (const level of levels) {
        const url = `https://${region}.api.riotgames.com/lol/challenges/v1/challenges/${challengeId}/leaderboards/by-level/${level}?limit=3&api_key=${process.env.RIOT_API_KEY}`;
        axios.get(url).then((result) => {
          for (const entry of result.data) {
            console.log(entry);
            const { puuid } = entry;
            const docRef = config.db.collection('summoner').doc(puuid);

            docRef.get().then((doc) => {
              if (doc.exists) {
                const data = doc.data();
                console.log(`Summoner found! ${data}`);
                addEntryToLeaderboard(
                  region, challengeId, level, date, entry, data
                );
              } else {
                const summoner = `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`;
                axios.get(summoner).then(async (summonerResponse) => {
                  console.log(summonerResponse.data);
                  await config.db.collection('summoner').doc(summonerResponse.data.puuid).set(summonerResponse.data);
                  await addEntryToLeaderboard(
                    region, challengeId, level, date, entry, summonerResponse.data
                  );
                }).catch((error) => console.log(`Error fetching summoner data: ${error}`));
              }
            });
            syncDelay(1300); // prevent rate limits
          }
        });
      }
    }
    res.json({
      message: 'success'
    });
  } catch (e) {
    console.error('Error: ', e);
  }
});

module.exports = router;
