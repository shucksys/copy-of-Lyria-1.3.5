(function() {
  var nextQuest = null;
  var nextCoop  = null;
  var currCoop  = null;
  var nextRaids = null;
  var isMagFest = false;
  var nextRaids = {};
  var currRaids = [];
  var imageURL  = '../../assets/images/';
  var greyIcon  = '../../assets/images/icons/6201763.png';
  var blankIcon = '../../assets/images/icons/handtinytrans.gif';
  var eyeIcon   = '../../assets/images/icons/5100123.png';
  var dogeIcon  = '../../assets/images/icons/1300023.png';

  var raidImageURL = 'http://gbf.game-a1.mbga.jp/assets_en/img/sp/assets/summon/qm/';
  var isHL = false;

  var currRaidID = null;
  var currCoopID = null;

  var mainCharacterImageURL = 'http://game-a1.granbluefantasy.jp/assets/img/sp/assets/leader/raid_normal/'; //.jpg
  var characterImageURL     = 'http://game-a1.granbluefantasy.jp/assets/img/sp/assets/npc/raid_normal/';    //.jpg
  var enemyImageURL         = 'http://gbf.game-a1.mbga.jp/assets_en/img/sp/assets/enemy/s/';
  var skillImageURL         = 'http://game-a1.granbluefantasy.jp/assets/img/sp/ui/icon/ability/m/';         //.png
  var skillImageClosingURL = '.png?1458197995';
  var statusImageURL        = 'http://game-a1.granbluefantasy.jp/assets/img/sp/ui/icon/status/x64/status_';  //.png
  var summonImageURL        = 'http://game-a1.granbluefantasy.jp/assets/img/sp/assets/summon/raid_normal/';

  var remainingQuests = {
    '300011' : null,
    '300021' : null,
    '300031' : null,
    '300041' : null,
    '305011' : null,
    '300051' : null,
    '300421' : null,
    '301381' : null,
    '300441' : null,
    '300451' : null,
    '303051' : null,
    '303181' : null,

    '300061' : null,
    '300071' : null,
    '300081' : null,
    '300091' : null,
    '305021' : null,
    '300101' : null,
    '300411' : null,
    '301071' : null,
    '300491' : null,
    '300501' : null,
    '302751' : null,
    '303151' : null,

    '300111' : null,
    '300121' : null,
    '300141' : null,
    '300151' : null,
    '305031' : null,
    '300161' : null,
    '300381' : null,
    '300481' : null,
    '300511' : null,
    '300521' : null,
    '303041' : null,
    '303161' : null,

    '300171' : null,
    '300181' : null,
    '300191' : null,
    '305041' : null,
    '300261' : null,
    '300391' : null,
    '301371' : null,
    '300531' : null,
    '300541' : null,
    '302711' : null,
    '303171' : null,

    '300201' : null,
    '300211' : null,
    '300221' : null,
    '305051' : null,
    '300271' : null,
    '300431' : null,
    '300461' : null,
    '300561' : null,
    '300571' : null,
    '303061' : null,
    '303191' : null,

    '300231' : null,
    '300241' : null,
    '300251' : null,
    '305061' : null,
    '300281' : null,
    '300401' : null,
    '300551' : null,
    '300581' : null,
    '300591' : null,
    '303071' : null,
    '303221' : null,

    '300291' : null,
    '301051' : null,
    '303131' : null,
    '300471' : null,
    '301061' : null,
    '303141' : null,
  };

  var createRaid = function(sequence, sequence2, name, max, magDelta, url, animeIDs, animeCounts, animeTypes, isHL) {
    return {
      sequence:    sequence,
      sequence2:   sequence2,
      name:        name,
      max:         max,
      magDelta:    magDelta,
      url:         imageURL + 'quests/' + url,
      animeIDs:    animeIDs,
      animeCounts: animeCounts,
      animeTypes:  animeTypes,
      isHL:        isHL,
      isEnabled:   true,
    };
  };

  var raidList = [
    '300011', '300021', '300031', '300041', '305011', '300051', '300421', '301381', '300441', '300451', '303051', '303181',
    '300061', '300071', '300081', '300091', '305021', '300101', '300411', '301071', '300491', '300501', '302751', '303151',
    '300111', '300121', '300141', '300151', '305031', '300161', '300381', '300481', '300511', '300521', '303041', '303161',
    '300171', '300181', '300191', '300261', '305041', '300391', '301371', '300531', '300541', '302711', '303171',
    '300201', '300211', '300221', '300271', '305051', '300431', '300461', '300561', '300571', '303061', '303191',
    '300231', '300241', '300251', '300281', '305061', '300401', '300551', '300581', '300591', '303071', '303221',
    '300291', '301051', '303131', '300471', '301061', '303141'
  ];

  var currRaidList      = [];
  var hiddenRaidList    = [];
  var completedRaidList = [];

  // Used for raids that share hosts limits
  var raidPairs = [
    ['300041', '305011'],
    ['300091', '305021'],
    ['300151', '305031'],
    ['300191', '305041'],
    ['300221', '305051'],
    ['300251', '305061']
  ];

  //var createRaid = function(sequence, sequence2, name, max, magDelta, url, animeIDs, animeCounts, animeTypes, isHL)
  var raidInfo = {
    '300011' : createRaid(1,  1,  'Griffin (N)',    3, 2, '2030003000.jpg', null, null, null, false),
    '300021' : createRaid(2,  4,  'Griffin (H)',    3, 2, '2030003000_hard.jpg', null, null, null, false),
    '300031' : createRaid(3,  10, 'Tiamat (N)',     3, 2, '2030000000.png', null, null, null, false),
    '300041' : createRaid(4,  16, 'Tiamat (H)',     3, 2, '2030000000_hard.png', null, null, null, false),
    '305011' : createRaid(5,  22, 'Tiamat (H+)',    1, 2, '2030000000_hard_plus.png', null, null, null, false),
    '300051' : createRaid(6,  28, 'Tiamat (EX)',    3, 2, '2040020000_ex.jpg', ['18'], [2], ['raid'], false),
    '300421' : createRaid(7,  34, 'Nezha (EX)',     2, 0, '2040042000_ex.jpg', ['1343', '1141'], [50, 6], ['material', 'material'], false),
    '301381' : createRaid(8,  40, 'Garuda (EX)',    2, 0, '2040071000_ex.jpg', ['1343', '1141'], [50, 6], ['material', 'material'], false),
    '300441' : createRaid(9,  49, 'Tiamat (HL)',    2, 0, '2040020000_high.jpg', ['32'], [3], ['raid'], true),
    '300451' : createRaid(10, 56, 'Nezha (HL)',     1, 0, '2040042000_high.jpg', ['44'], [1], ['raid'], true),
    '303051' : createRaid(11, 62, 'Morrigna (HL)',  1, 0, '303051_high.png', ['44'], [1], ['raid'], true),
    '303181' : createRaid(12, 68, 'Grimnir (HL)',   2, 0, '303181_high.png', ['525'], [1], ['raid'], true),

    '300061' : createRaid(13, 2,  'Flame (N)',      3, 2, '2020018001.jpg', null, null, null, false),
    '300071' : createRaid(14, 5,  'Flame (H)',      3, 2, '2020018001_hard.jpg', null, null, null, false),
    '300081' : createRaid(15, 11, 'Colossus (N)',   3, 2, '2030001000.png', null, null, null, false),
    '300091' : createRaid(16, 17, 'Colossus (H)',   3, 2, '2030001000_hard.png', null, null, null, false),
    '305021' : createRaid(17, 23, 'Colossus (H+)',  1, 2, '2030001000_hard_plus.png', null, null, null, false),
    '300101' : createRaid(18, 29, 'Colossus (EX)',  3, 2, '2040034000_ex.jpg', ['19'], [2], ['raid'], false),
    '300411' : createRaid(19, 35, 'Elements (EX)',  2, 0, '2040063000_ex.jpg', ['1313', '1111'], [50, 6], ['material', 'material'], false),
    '301071' : createRaid(20, 41, 'Athena (EX)',    2, 0, '2040021000_ex.jpg', ['1313', '1111'], [50, 6], ['material', 'material'], false),
    '300491' : createRaid(21, 50, 'Colossus (HL)',  2, 0, '2040034000_high.jpg', ['47'], [3], ['raid'], true),
    '300501' : createRaid(22, 57, 'Elements (HL)',  1, 0, '2040063000_high.jpg', ['41'], [1], ['raid'], true),
    '302751' : createRaid(23, 63, 'Prom (HL)',      1, 0, '302751_high.png', ['41'], [1], ['raid'], true),
    '303151' : createRaid(24, 69, 'Shiva (HL)',     2, 0, '303151_high.png', ['522'], [1], ['raid'], true),

    '300111' : createRaid(25, 3,  'Guard (N)',      3, 2, '2030013001.jpg', null, null, null, false),
    '300121' : createRaid(26, 6,  'Guard (H)',      3, 2, '2030013001_hard.jpg', null, null, null, false),
    '300141' : createRaid(27, 12, 'Leviathan (N)',  3, 2, '2030011000.png', null, null, null, false),
    '300151' : createRaid(28, 18, 'Leviathan (H)',  3, 2, '2030011000_hard.png', null, null, false),
    '305031' : createRaid(29, 24, 'Leviathan (H+)', 1, 2, '2030011000_hard_plus.png', null, null, false),
    '300161' : createRaid(30, 30, 'Leviathan (EX)', 3, 2, '2040028000_ex.jpg', ['20'], [2], ['raid'], false),
    '300381' : createRaid(31, 36, 'Macula (EX)',    2, 0, '2040002000_ex.jpg', ['1323', '1121'], [50, 6], ['material', 'material'], false),
    '300481' : createRaid(32, 42, 'Grani (EX)',     2, 0, '2040007000_ex.jpg', ['1323', '1121'], [50, 6], ['material', 'material'], false),
    '300511' : createRaid(33, 51, 'Leviathan (HL)', 2, 0, '2040028000_high.jpg', ['48'], [3], ['raid'], true),
    '300521' : createRaid(34, 58, 'Macula (HL)',    1, 0, '2040002000_high.jpg', ['42'], [1], ['raid'], true),
    '303041' : createRaid(35, 64, 'Ca Ong (HL)',    1, 0, '303041_high.png', ['42'], [1], ['raid'], true),
    '303161' : createRaid(36, 70, 'Europa (HL)',    2, 0, '303161_high.png', ['523'], [1], ['raid'], true),

    '300171' : createRaid(37, 7,  'Dragon (H)',     3, 2, '2030004000_hard.jpg', null, null, null, false),
    '300181' : createRaid(38, 13, 'Yggdrasil (N)',  3, 2, '2030015000.png', null, null, null, false),
    '300191' : createRaid(39, 19, 'Yggdrasil (H)',  3, 2, '2030015000_hard.png', null, null, null, false),
    '305041' : createRaid(40, 25, 'Yggdrasil (H+)', 1, 2, '2030015000_hard_plus.png', null, null, null, false),
    '300261' : createRaid(41, 31, 'Yggdrasil (EX)', 3, 2, '2040027000_ex.jpg', ['21'], [2], ['raid'], false),
    '300391' : createRaid(42, 37, 'Medusa (EX)',    2, 0, '2040059000_ex.jpg', ['1333', '1131'], [50, 6], ['material', 'material'], false),
    '301371' : createRaid(43, 43, 'Baal (EX)',      2, 0, '2040013000_ex.jpg', ['1333', '1131'], [50, 6], ['material', 'material'], false),
    '300531' : createRaid(44, 52, 'Yggdrasil (HL)', 2, 0, '2040027000_high.jpg', ['49'], [3], ['raid'], true),
    '300541' : createRaid(45, 59, 'Medusa (HL)',    1, 0, '2040059000_high.jpg', ['43'], [1], ['raid'], true),
    '302711' : createRaid(46, 65, 'Gilga (HL)',     1, 0, '302711_high.png', ['43'], [1], ['raid'], true),
    '303171' : createRaid(47, 71, 'Alexiel (HL)',   2, 0, '303171_high.png', ['524'], [1], ['raid'], true),

    '300201' : createRaid(48, 8,  'Wisp (H)',       3, 2, '2030027000_hard.jpg', null, null, null, false),
    '300211' : createRaid(49, 14, 'Adversa (N)',    3, 2, '2030035000.png', null, null, null, false),
    '300221' : createRaid(50, 20, 'Adversa (H)',    3, 2, '2030035000_hard.png', null, null, null, false),
    '305051' : createRaid(51, 26, 'Adversa (H+)',   1, 2, '2030035000_hard_plus.png', null, null, null, false),
    '300271' : createRaid(52, 32, 'Luminiera (EX)', 3, 2, '2040047000_ex.jpg', ['26'], [2], ['raid'], false),
    '300431' : createRaid(53, 38, 'Apollo (EX)',    2, 0, '2040023000_ex.jpg', ['1353', '1151'], [50, 6], ['material', 'material'], false),
    '300461' : createRaid(54, 44, 'Odin (EX)',      2, 0, '2040029000_ex.jpg', ['1353', '1151'], [50, 6], ['material', 'material'], false),
    '300561' : createRaid(55, 53, 'Luminiera (HL)', 2, 0, '2040047000_high.jpg', ['50'], [3], ['raid'], true),
    '300571' : createRaid(56, 60, 'Apollo (HL)',    1, 0, '2040023000_high.jpg', ['45'], [1], ['raid'], true),
    '303061' : createRaid(57, 66, 'Hector (HL)',    1, 0, '303061_high.png', ['45'], [1], ['raid'], true),
    '303191' : createRaid(58, 72, 'Metatron (HL)',  2, 0, '303191_high.png', ['526'], [1], ['raid'], true),

    '300231' : createRaid(59, 9,  'Eye (H)',        3, 2, '2030038000_hard.jpg', null, null, null, false),
    '300241' : createRaid(60, 15, 'Celeste (N)',    3, 2, '2030041000.png', null, null, null, false),
    '300251' : createRaid(61, 21, 'Celeste (H)',    3, 2, '2030041000_hard.png', null, null, null, false),
    '305061' : createRaid(62, 27, 'Celeste (H+)',   1, 2, '2030041000_hard_plus.png', null, null, null, false),
    '300281' : createRaid(63, 33, 'Celeste (EX)',   3, 2, '2040046000_ex.jpg', ['31'], [2], ['raid'], false),
    '300401' : createRaid(64, 39, 'Olivia (EX)',    2, 0, '2040005000_ex.jpg', ['1363', '1161'], [50, 6], ['material', 'material'], false),
    '300551' : createRaid(65, 45, 'Lich (EX)',      2, 0, '2040012000_ex.jpg', ['1363', '1161'], [50, 6], ['material', 'material'], false),
    '300581' : createRaid(66, 54, 'Celeste (HL)',   2, 0, '2040046000_high.jpg', ['51'], [3], ['raid'], true),
    '300591' : createRaid(67, 61, 'Olivia (HL)',    1, 0, '2040005000_high.jpg', ['46'], [1], ['raid'], true),
    '303071' : createRaid(68, 67, 'Anubis (HL)',    1, 0, '303071_high.png', ['46'], [1], ['raid'], true),
    '303221' : createRaid(69, 73, 'Avatar (HL)',    2, 0, '303221_high.png', ['527'], [1], ['raid'], true),
    
    '300291' : createRaid(70, 46, 'Bahamut (EX)',   3, 0, '2030002000_hell.jpg', ['58'], [1], ['raid'], false),
    '301051' : createRaid(71, 47, 'Grand (EX)',     2, 0, '2040065000_hell.jpg', ['82'], [1], ['raid'], false),
    '303131' : createRaid(72, 48, 'Ulti Baha (EX)', 1, 0, '303131_hell.png', ['133'], [1], ['raid'], true),
    '300471' : createRaid(73, 55, 'Rose (HL)',      1, 0, '2040105000_high.jpg', ['1204'], [10], ['material'], true),
    '301061' : createRaid(74, 74, 'Bahamut (HL)',   1, 0, '2040128000_hell.jpg', ['59'], [1], ['raid'], true),
    '303141' : createRaid(75, 75, 'Ulti Baha (HL)', 1, 0, '303141_hell.png', ['136'], [1], ['raid'], true)
  };

  var tweetHash = (function () {
    var json = null;
    $.ajax({
      'async': false,
      'global': false,
      'url': 'src/assets/dictionaries/tweet_hashes.json',
      'dataType': 'json'
    }).done(function (data) {
      json = data;
    })
    return json;
  })();;

  var jpTweetHash = {};

  for (var property in tweetHash) {
    if (!tweetHash.hasOwnProperty(property)) continue;
    jpTweetHash[tweetHash[property]] = property;
  }

  var sortByElement = function(a, b) {
    return raidInfo[a].sequence - raidInfo[b].sequence;
  };

  var sortByDifficulty = function(a, b) {
    return raidInfo[a].sequence2 - raidInfo[b].sequence2;
  };

  var quests = {};
  var raids  = [];
  var createQuest = function(id, url, devID) {
    var devIDs = [];
    if (devID !== undefined) {
      devIDs.push(devID);
    }
    return {
      id:         id,
      url:        url,
      image:      greyIcon,
      characters: [null, null, null, null, null, null],
      charNum:    0,
      formation:  [],
      buffs:      [],
      enemies:    [null, null, null],
      summons:    [null, null, null, null, null, null],
      devIDs:     devIDs,
      lyria_pos:  -1,
      lyria_num:  -1,
      potions: {
        'elixir': {
          'count': null,
          'limit_flg': null,
          'limit_number': null,
          'limit_remain': null
        },
        'small': null,
        'large': null
      }
    };
  };

  var createCharacter = function (name, id, image, currHP, maxHP, currCharge, maxCharge, attribute, leader, data) {
    return {
      name: name,
      id: id,
      image: image,
      currHP: currHP,
      maxHP: maxHP,
      currCharge: currCharge,
      maxCharge: maxCharge,
      attribute: attribute,
      leader: leader,
      abilities: [null, null, null, null],
      buffs: [],
      debuffs: [],
      data: data
    };
  };

  var createSkill = function(name, id, image, cooldown, turns, time, data) {
    return {
      name:     name,
      id:       id,
      image:    image,
      cooldown: cooldown,
      turns:    turns,
      time:     time,
      data:     data
    };
  };
  var createBuff = function(owner, image, turns) {
    return {
      owner: owner,
      image: image,
      turns: turns
    };
  };

    //var enemies = [null, null, null];

  var createEnemy = function(currHP, maxHP) {
    return {
      image:      null,
      currHP:     currHP,
      maxHP:      maxHP,
      currCharge: null,
      maxCharge:  null,
      mode:       null,
      debuffs:    []
    };
  };

  var createDebuff = function(owner, image, time) {
    return {
      owner: owner,
      image: image,
      time:  time
    };
  };
  var createSummon = function(image, cooldown) {
    return {
      image:    image,
      cooldown: cooldown,
      onceOnly: false
    };
  };

  var questImageURLs = {};
  var events         = [];

  var createEvent = function(url) {
    var bosses    = [];
    var bossID    = null;
    var currency1 = null;
    var currency2 = null;
    if (url.indexOf('teamraid') !== -1) {
      currency1 = '10022';
      bossID    = '7139';

      bosses.push({
        'image':       eyeIcon,
        'id':          '31',
        'ap':          25,
        'currency1':   0,
        'currency2':   0,
        'hasAP':       false,
        'hasCurrency': true
      });

      bosses.push({
        'image':       dogeIcon,
        'id':          '41',
        'ap':          30,
        'currency1':   2,
        'currency2':   0,
        'hasAP':       false,
        'hasCurrency': false
      });

      bosses.push({
        'image':       dogeIcon,
        'id':          '51',
        'ap':          50,
        'currency1':   5,
        'currency2':   0,
        'hasAP':       false,
        'hasCurrency': false
      });
    }
    return {
      url:       url,
      bosses:    bosses,
      bossID:    bossID,
      currency1: currency1,
      currency2: currency2,
    };
  };
  events.push(createEvent('#event/teamraid024'));

  window.Quest = {
    Initialize: function(callback) {
      if (Options.Get('sortRaidsDifficulty')) {
        raidList.sort(sortByDifficulty);
      }

      for (var i = 0; i < raidList.length; i++) {
        currRaidList.push(raidList[i]);
      }

      Storage.GetMultiple(['quests'], function(response) {
        if (response['quests'] !== undefined) {
          var modified = false;
          for (var key in remainingQuests) {
            if (response['quests'][key] === undefined) {
              if (response['quests'][key] == undefined) {
                if (!Options.Get('isMagFest')) {
                  response['quests'][key] = raidInfo[key].max;
                } else {
                  response['quests'][key] = raidInfo[key].max + raidInfo[key].magDelta;
                }
              }
              modified = true;
            }
          }

          for (var i = 0; i < raidList.length; i++) {
            setRemainingRaids(raidList[i], response['quests'][raidList[i]]);
          }

          if (modified) {
            saveRemainingRaids();
          }
        } else {
          for (var i = 0; i < raidList.length; i++) {
            if (!Options.Get('isMagFest')) {
              setRemainingRaids(raidList[i], raidInfo[raidList[i]].max);
            } else {
              setRemainingRaids(raidList[i], raidInfo[raidList[i]].max + raidInfo[raidList[i]].magDelta);
            }
          }
          saveRemainingRaids();
        }
        if (callback !== undefined) {
          callback();
        }
      });

      isMagFest = Options.Get('isMagFest', function(id, value) {
        var currMag = isMagFest;
        isMagFest = value;
        for (var i = 0; i < raidList.length; i++) {
          raidID = raidList[i];
          if (currMag && !value) {
            setRemainingRaids(raidID, remainingQuests[raidID] - raidInfo[raidID].magDelta);
          } else if (!currMag && value) {
            setRemainingRaids(raidID, remainingQuests[raidID] + raidInfo[raidID].magDelta);
          } else {
            setRemainingRaids(raidID, remainingQuests[raidID]);
          }
        }
        saveRemainingRaids();
      });

      Options.Get('sortRaidsDifficulty', function(id, value) {
        sortRaids(value);
      });

      for (var i = 0; i < raidList.length; i++) {
        Options.Get(raidList[i], function(id, value) {
          setRemainingJquery(id);
        });
      }

      for (var i = 0; i < raidList.length; i++) {
        var id = raidList[i];
        if (raidInfo[id].animeIDs !== null) {
          for (var j = 0; j < raidInfo[id].animeIDs.length; j++) {
            var temp = id;
            Supplies.Get(raidInfo[id].animeIDs[j], raidInfo[id].animeTypes[j], function(animeID, num) {
              Message.PostAll({
                'type': 'setText',
                'data': {
                  'id': '.anime-count-' + animeID,
                  'value': num
                }
              });
            });
          }
        }
      }

      for (var i = 0; i < events.length; i++) {
        if (events[i].currency1 !== null) {
          Supplies.Get(events[i].currency1, 'event', function(id, num) {
            for (var i = 0; i < events.length; i++) {
              if (events[i].currency1 === id) {
                Message.PostAll({
                  'type': 'setText',
                  'data': {
                    'id':   '#event-item-' + i,
                    'value': num
                  }
                });
                for (var j = 0; j < events[i].bosses.length; j++) {
                  if (num >= events[i].bosses[j].currency1) {
                    events[i].bosses[j].hasCurrency = true;
                  } else {
                    events[i].bosses[j].hasCurrency = false;
                  }
                  var url;
                  if (!events[i].bosses[j].hasAP || ! events[i].bosses[j].hasCurrency) {
                    url = events[i].url;
                  } else {
                    url = events[i].url + '/supporter/' + events[i].bossID + events[i].bosses[j].id + '/1';
                  }
                  Message.PostAll({
                    'type': 'setClick',
                    'data': {
                      'id': '#event-image-' + j,
                      'value': url
                    }
                  });
                }
              }
            }
          });
        }
      }

      APBP.GetAP(function(num) {
        for (var i = 0; i < events.length; i++) {
          for (var j = 0; j < events[i].bosses.length; j++) {
            if (num >= events[i].bosses[j].ap) {
              events[i].bosses[j].hasAP = true;
            } else {
              events[i].bosses[j].hasAP = false;
            }

            var url;
            if (!events[i].bosses[j].hasAP || ! events[i].bosses[j].hasCurrency) {
              url = events[i].url;
            } else {
              url = events[i].url + '/supporter/' + events[i].bossID + events[i].bosses[j].id + '/1';
            }

            Message.PostAll({
              'type': 'setClick',
              'data': {
                'id': '#event-image-' + j,
                'value': url
              }
            });
          }
        }
      });
    },

    InitializeDev: function() {
      var response = [];
      for (var i = 0; i < raidList.length; i++) {
        var raid = raidInfo[raidList[i]];
        var animeAmounts = null;
        if (raid.animeIDs !== null) {
          animeAmounts = [];
          for (var j = 0; j < raid.animeIDs.length; j++) {
            animeAmounts[j] = Supplies.Get(raid.animeIDs[j], raid.animeTypes[j]);
          }
        }

        var max = raid.max;
        if (Options.Get('isMagFest')) {
          max += raid.magDelta;
        }

        response.push({
          'type': 'addQuest',
          'data': {
            'id': raidList[i],
            'url': raid.url,
            'name': raid.name,
            'amount': remainingQuests[raidList[i]],
            'max': max,
            'animeIDs': raid.animeIDs,
            'animeAmounts': animeAmounts
          }
        });
      }

      for (var i = 0; i < completedRaidList.length; i++) {
        response.push({
          'type': 'appendObject',
          'data': {
            'id': '#daily-raid-' + completedRaidList[i],
            'target': '#completed-raid-list'
          }
        });
      }

      for (var i = 0; i < 4; i++) {
        response.push({
          'type': 'addQuestCharacter',
          'data': {
            'index': i
          }
        });
      }

      for (var i = 0; i < 3; i++) {
        response.push({
          'type': 'addQuestEnemy',
          'data': {
            'index': i
          }
        });
      }

      for (var i = 0; i < events.length; i++) {
        response.push({
          'type': 'setText',
          'data': {
            'id': '#event-item-' + i,
            'value': Supplies.Get(events[i].currency1, 'event')
          }
        });
        for (var j = 0; j < events[i].bosses.length; j++) {
          response.push({
            'type': 'setClick',
            'data': {
              'id': '#event-image-' + j,
              'value': events[i].bosses[j].url
            }
          });
        }
      }

      for (var i = 0; i < raidList.length; i++) {
        response.push({
          'type': 'hideObject',
          'data': {
            'id': '#daily-raid-' + raidList[i],
            'value': !Options.Get(raidList[i])
          }
        });
      }

      return response;
    },

    Reset: function() {
      for (var key in remainingQuests) {
        if (remainingQuests.hasOwnProperty(key)) {
          if (!Options.Get('isMagFest')) {
            setRemainingRaids(key, raidInfo[key].max);
          } else {
            setRemainingRaids(key, raidInfo[key].max + raidInfo[key].magDelta);
          }
        }
      }
      saveRemainingRaids();
    },

    CheckDailyRaid: function(json, url) {
      var id = url.substring(url.lastIndexOf('/') + 1, url.indexOf('?'));
      if (remainingQuests[id] !== undefined) {
        if (json.result === 'ok') {
          setRemainingRaids(id, parseInt(json.limited_count));
        } else {
          setRemainingRaids(id, 0);
        }
      }
      saveRemainingRaids();
    },

    CreateQuest: function(json, payload, devID) {
      // TODO: Why is this a global? Who's using it?
      var id = '' + payload.quest_id;
      // response no longer being sent from this request?
      if (json !== undefined && json !== null) {
        quests[id] = createQuest('' + json.raid_id, '#raid/', devID);
      } else {
        quests[id] = createQuest(null, '#raid/', devID);
      }
      var currQuest = quests[id];
      if (remainingQuests[id] !== undefined) {
        var pairID = -1;
        for (var i = 0; i < raidPairs.length; i++)  {
          pairID = raidPairs[i].indexOf(id);
          if (pairID !== -1) {
            setRemainingRaids(raidPairs[i][1 - pairID], 0);
          }
        }
        setRemainingRaids(id, remainingQuests[id] - 1);
        saveRemainingRaids();
        if (raidInfo[id].animeIDs !== null && payload.use_item_id !== undefined) {
          var index = raidInfo[id].animeIDs.indexOf(payload.use_item_id);
          Supplies.Increment(raidInfo[id].animeIDs[index], '10', -raidInfo[id].animeCounts[index]);
        }
      }
      for (var i = 0; i < events.length; i++) {
        if (events[i].bossID !== null) {
          for (var j = 0; j < events[i].bosses.length; j++) {
            if (id === (events[i].bossID + events[i].bosses[j].id)) {
              APBP.InitializeQuest({'action_point': events[i].bosses[j].ap});
              if (events[i].currency1 !== null) {
                Supplies.Increment(events[i].currency1, '10', -events[i].bosses[j].currency1);
              }
              if (events[i].currency2 !== null) {
                Supplies.Increment(events[i].currency2, '10', -events[i].bosses[j].currency2);
              }
            }
          }
        }
      }
      if (payload.quest_type) {
        if (payload.quest_type === 1 || payload.quest_type === 7) {
          currQuest.url = '#raid_multi/';
        }
      }
      setQuestsJQuery(id);
    },

    CheckMulti: function(json) {
      if (json.quest_type === 1 || json.quest_type === 7) {
        //quest.url = '#raid_multi/';
      }
    },

    CreateRaid: function(payload, devID) {
      var id = '' + payload.raid_id;
      for (var i = 0; i < raids.length; i++) {
        if (raids.id === id) {
          return;
        }
      }
      raids.push(createQuest(id, '#raid_multi/', devID));
      setQuestsJQuery(id);
    },

    CompleteQuest: function (json, url, devID) {
      var isCoop = false;
      if (json.url === 'coopraid') {
        isCoop = true;
        if (Options.Get('skipCoopResults')) {
          Message.OpenURL('#coopraid', devID);
          //Message.Post(devID, { 'type': 'openURL', 'data': '#coopraid' });
        }
      }
      var id = url.substring(url.lastIndexOf('/') + 1, url.indexOf('?'));
      //if (quests[id] !== undefined && quests[id] !== null) {
      //  console.log(quest.id);
      //}
      //for (var i = 0; i < raids.length; i++) {
      //  console.log(raids[i].id);
      //}
      for (var i in quests) {
        if (!quests.hasOwnProperty(i)) continue;
        if (quests[i] !== undefined && quests[i] !== null && quests[i].id === id) {
          if (!isCoop) {
            Message.Post(devID, { 'type': 'autoRepeat', 'data': i });
          }
          delete quests[i];
        }
      }
      //for (var i = 0; i < raids.length; i++) {
      //  if (raids[i].id === id) {
      //    raids.splice(i, 1);
      //  }
      //}
      setQuestsJQuery(id);
    },

    StartBattle: function (json, devID) {
      if (json === undefined || json === null) {
        return;
      }
      var id = '' + json.raid_id;
      var quest_id = '' + json.quest_id;
      var turn = null;
      var ability_turn = null;
      var enemies = null;
      var characters = null;
      var formation = null;
      var summons = null;
      var potions = null;
      var summonCooldowns = null;
      var hasLeader = false;
      var canSummon = false;
      var syncTurns = Options.Get('syncAll') || Options.Get('syncTurns');
      var syncAbilityTurns = Options.Get('syncAll') || Options.Get('syncAbilityTurns');
      var syncBossHP = Options.Get('syncAll') || Options.Get('syncBossHP');
      var syncPlayerHP = Options.Get('syncAll') || Options.Get('syncPlayerHP');
      var syncPotions = Options.Get('syncAll') || Options.Get('syncPotions');
      var syncAbilities = Options.Get('syncAll') || Options.Get('syncAbilities');
      var syncSummons = Options.Get('syncAll') || Options.Get('syncSummons');
      var syncPlayerFormation = Options.Get('syncAll') || Options.Get('syncPlayerFormation');
      var currQuest;

      if (json.twitter !== undefined && json.twitter.battle_id !== undefined) {
        Message.Post(devID, {
          'type': 'setClick',
          'data': {
            'id': '#quest-copy',
            'value': json.twitter.battle_id + ' (' +  json.twitter.monster + ') '
          }
        });
        Message.Post(devID, {
          'type': 'setTooltip',
          'data': {
            'id': '#quest-copy',
            'text': json.twitter.battle_id + ' (' +  json.twitter.monster + ') '
          }
        });
      }
      if (quests[quest_id] !== undefined && quests[id] !== null) {
        quests[quest_id].id = id;
        currQuest = quests[quest_id];
      } else if ((quests[quest_id] === undefined || quests[quest_id] === null) && json.quest_id && json.multi === 0) {
        quests[quest_id] = createQuest(id, '#raid/', devID);
        currQuest = quests[quest_id];
      } else if (!json.quest_id && json.multi === 1 && json.is_host) {
        for (var i in quests) {
          if (!quests.hasOwnProperty(i)) continue;
          if (quests[i] !== undefined && quests[i] !== null && quests[i].id === id) {
            currQuest = quests[i];
          }
        }
      }
      if (currQuest === undefined) {
        var exists = false;
        for (var i = 0; i < raids.length; i++) {
          if (raids[i].id === id) {
            exists = true;
            currQuest = raids[i];
            break;
          }
        }
        if (!exists) {
          raids.push(createQuest(id, '#raid_multi/', devID));
          currQuest = raids[raids.length - 1];
        }
      }
      if (currQuest.devIDs.indexOf(devID) === -1) {
        currQuest.devIDs.push(devID);
      }

      var player = json.player;

      if (player && player !== null && player.param && player.param !== null) {
        var chars = player.param;
        currQuest.charNum = player.number;

        for (var i = 0; i < player.number; i++) {
          if (chars[i].leader == 1) {
            image = mainCharacterImageURL + chars[i].pid_image + '.jpg';
          } else {
            image = characterImageURL + chars[i].pid_image + '.jpg';
          }
          // var createCharacter = function (name, id, image, currHP, maxHP, currCharge, maxCharge, attribute, leader) 
          currQuest.characters[i] = createCharacter(
            chars[i].name,
            chars[i].pid,
            image,
            parseInt(chars[i].hp),
            parseInt(chars[i].hpmax),
            parseInt(chars[i].recast),
            parseInt(chars[i].recastmax),
            chars[i].attr,
            chars[i].leader,
            chars[i]
          );
        }
      }

      if (json.formation) {
        currQuest.formation = json.formation;
      }

      if (json.ability) {
        var abilities;
        var ability;
        for (var i in json.ability) {
          if (!json.ability.hasOwnProperty(i) ||
            json.ability[i].list === undefined) {
            continue;
          }
          var pos = json.ability[i].pos;
          if (currQuest.characters[pos] === null) continue;
          abilities = json.ability[i].list;
          for (var j in abilities) {
            if (!abilities.hasOwnProperty(j)) {
              continue;
            }
            ability = abilities[j][0];
            image = skillImageURL + ability.class.match(/ico-ability(\d+_\d+)/i)[1] + '.png';

            currQuest.characters[pos].abilities[j - 1] = createSkill(
              ability['ability-name'],
              ability['ability-id'],
              image,
              parseInt(ability['ability-recast']),
              parseInt(ability.duration),
              parseInt(ability['duration-second']),
              ability
            );
          }
        }
      }

      if (json.boss && json.boss.param) {
        for (var i = 0; i < json.boss.param.length; i++) {
          if (currQuest.enemies[i] === null) {
            currQuest.enemies[i] = createEnemy(parseInt(json.boss.param[i].hp), parseInt(json.boss.param[i].hpmax));
          } else {
            currQuest.enemies[i].currHP = parseInt(json.boss.param[i].hp);
            currQuest.enemies[i].maxHP = parseInt(json.boss.param[i].hpmax);
          }
        }
        currQuest.image = enemyImageURL + json.boss.param[0].cjs.substring(json.boss.param[0].cjs.lastIndexOf('_') + 1) + '.png';
      }

      if (json.potion) {
        currQuest.potions.elixir.count = json.potion.count;
        currQuest.potions.elixir.limit_flg = json.potion.limit_flg;
        currQuest.potions.elixir.limit_number = json.potion.limit_number;
        currQuest.potions.elixir.limit_remain = json.potion.limit_number;
      }

      if (json.is_trialbattle) {
        currQuest.potions.elixir.is_trialbattle = json.is_trialbattle;
      } else {
        currQuest.potions.elixir.is_trialbattle = false;
      }

      if (json.temporary) {
        currQuest.potions.small = json.temporary.small;
        currQuest.potions.large = json.temporary.large;
      }

      if (json.event && json.event.item) {
        for (var key in json.event.item) {
          if (!json.event.item.hasOwnProperty(key)) continue;
          currQuest.potions[json.event.item[key].id] = json.event.item[key].number; 
        }
      }

      currQuest.lyria_num = json.lyria_num;
      currQuest.lyria_pos = json.lyria_pos;

      if (json.summon) {
        summonCooldowns = [];
        for (var i = 0; i < json.summon.length; i++) {
          if (json.summon[i].id !== null && json.summon[i].id !== '') {
            currQuest.summons[i] = createSummon(summonImageURL + json.summon[i].id + '.jpg', json.summon[i].recast);
            currQuest.summons[i].onceOnly = json.summon[i].special_once_flag;
            summonCooldowns.push({
              'turn': json.summon[i].recast,
              'special_once_flag': json.summon[i].special_once_flag
            });
          } else {
            summonCooldowns.push({
              'turn': null,
              'special_once_flag': false
            });
          }
        }
      }

      if (json.supporter !== undefined && json.supporter !== null) {
        if (json.supporter.recast !== undefined &&
            json.supporter.recast !== null &&
            json.supporter.special_once_flag !== undefined &&
            json.supporter.special_once_flag !== null) {
          currQuest.summons[i] = createSummon(summonImageURL + json.supporter.id + '.jpg', json.supporter.recast);
          currQuest.summons[i].onceOnly = json.supporter.special_once_flag;
          summonCooldowns.push({
            'turn': json.supporter.recast,
            'special_once_flag': json.supporter.special_once_flag
          });
        }
      }

      for (var i = 0; i < currQuest.formation.length; i++) {
        var pos = currQuest.formation[i];
        if (currQuest.characters[pos].leader && currQuest.characters[pos].currHP > 0) {
          hasLeader = true;
          break;
        }
      }

      if (currQuest.lyria_num !== -1) {
        if (currQuest.lyria_pos !== -1 &&
          currQuest.characters[currQuest.lyria_num] !== undefined &&
          currQuest.characters[currQuest.lyria_num] !== null &&
          currQuest.characters[currQuest.lyria_num].currHP > 0) {
          canSummon = true;
        }
      } else if (hasLeader) {
        canSummon = true;
      }

      if (syncTurns) {
        turn = json.turn;
      }
      if (syncAbilityTurns) {
        ability_turn = json.ability_turn;
      }
      if (syncBossHP) {
        enemies = currQuest.enemies;
      }
      if (syncAbilities || syncPlayerHP || syncPlayerFormation) {
        characters = currQuest.characters;
        formation = currQuest.formation;
      }
      if (syncSummons) {
        summons = {
          'cooldowns': summonCooldowns,
          'canSummon': canSummon,
          'summon_enable': json.summon_enable,
          'lyria_pos': currQuest.lyria_pos,
          'lyria_num': currQuest.lyria_num
        };
      }
      if (syncPotions) {
        potions = currQuest.potions;
      }

      if (syncTurns || syncBossHP || syncPlayerHP ||
        syncAbilities || syncSummons || syncPlayerFormation) {
        for (var i = 0; i < currQuest.devIDs.length; i++) {
          chrome.tabs.sendMessage(currQuest.devIDs[i], {
            'type': 'syncClient',
            'data': {
              'type': 'start',
              'turn': turn,
              'ability_turn': ability_turn,
              'raid_id': currQuest.id,
              'boss': enemies,
              'ignoredEnemyHPValues': null,
              'characters': characters,
              'formation': formation,
              'summons': summons,
              'hasFormationChanged': syncPlayerFormation,
              'potions': potions
            }
          });
        }
      }
      setQuestsJQuery(id);
    },

    BattleAction: function(json, payload, devID) {
      if (json === undefined || json === null || json.popup !== undefined) {
        return;
      }

      var id = '' + payload.raid_id;
      var currQuest = null;
      for (var i in quests) {
        if (!quests.hasOwnProperty(i)) continue;
        if (quests[i].id === id) {
          currQuest = quests[i];
        }
      }

      if (currQuest === null) {
        for (var i = 0; i < raids.length; i++) {
          if (raids[i].id === id) {
            currQuest = raids[i];
            break;
          }
        }
      }

      if (currQuest === null) {
        return;
      }

      if (currQuest.devIDs.indexOf(devID) === -1) {
        currQuest.devIDs.push(devID);
      }

      var syncTurns = Options.Get('syncAll') || Options.Get('syncTurns');
      var syncAbilityTurns = Options.Get('syncAll') || Options.Get('syncAbilityTurns');
      var syncBossHP = Options.Get('syncAll') || Options.Get('syncBossHP');
      var syncPlayerHP = Options.Get('syncAll') || Options.Get('syncPlayerHP');
      var syncPotions = Options.Get('syncAll') || Options.Get('syncPotions');
      var syncAbilities = Options.Get('syncAll') || Options.Get('syncAbilities');
      var syncSummons = Options.Get('syncAll') || Options.Get('syncSummons');
      var syncPlayerFormation = Options.Get('syncAll') || Options.Get('syncPlayerFormation');
      var ignoredEnemyHPValues = null;
      var enemies = null;
      var turn = null;
      var ability_turn = null;
      var characters = null;
      var formation = null;
      var hasFormationChanged = false;
      var summons = null;
      var summonCooldowns = null;
      var hasLeader = false;
      var canSummon = false;
      var potions = null;
      
      if (syncBossHP) {
        ignoredEnemyHPValues = [{}, {}, {}];
        enemies = currQuest.enemies;
      }
      
      if (json.scenario) {
        var isDamage        = false;
        var isFromPlayer    = false;
        var isSummon        = false;
        var isAttack        = false;
        var isOugi          = false;
        var isWin           = false;
        var refresh         = false;

        for (var i = 0; i < json.scenario.length; i++) {
          var action = json.scenario[i];
          isFromPlayer = (action.to === "boss") || (action.from === "player") || (action.target === "boss");

          switch (action.cmd) {
            case 'attack':
              if (action.damage !== undefined) {
                if (isFromPlayer) {
                  for (var j in action.damage) {
                    if (!action.damage.hasOwnProperty(j)) {
                      continue;
                    }
                    for (var k = 0; k < action.damage[j].length; k++) {
                      if (isNaN(action.damage[j][k].hp) || isNaN(action.damage[j][k].pos)) {
                        continue;
                      }
                      if (syncBossHP) {
                        ignoredEnemyHPValues[action.damage[j][k].pos][action.damage[j][k].hp] = true;
                      }
                    }
                  }
                  isDamage = true;
                } else {
                  for (var j in action.damage) {
                    if (!action.damage.hasOwnProperty(j)) {
                      continue;
                    }
                    for (var k = 0; k < action.damage[j].length; k++) {
                      var pos = currQuest.formation[action.damage[j][k].pos];
                      currQuest.characters[pos].currHP = parseInt(action.damage[j][k].hp);
                    }
                  }
                }
              }
              isAttack = true;
              break;
            case "heal":
              if (!isFromPlayer) {
                for (var j = 0; j < action.list.length; j++) {
                  var pos = currQuest.formation[action.list[j].pos];
                  currQuest.characters[pos].currHP = parseInt(action.list[j].hp);
                }
              }
              break;
            case "resurrection":
              currQuest.characters[action.index].currHP = action.hp;
              break;
            case "rematch":
              if (currQuest.charNum >= 4) {
                currQuest.formation = ['0', '1', '2', '3'];
              } else {
                currQuest.formation = [];
                for (var j = 0; j < currQuest.charNum; j++) {
                  currQuest.formation.push('' + j);
                }
              }
              if (action.hp) {
                for (var j = 0; j < action.hp.length; j++) {
                  if (currQuest.characters[j] !== null) {
                    currQuest.characters[j].currHP = action.hp[j];
                  }
                }
              } else {
                for (var j = 0; j < currQuest.characters.length; j++) {
                  if (currQuest.characters[j] !== null) {
                    currQuest.characters[j].currHP = currQuest.characters[j].maxHP;
                  }
                }
              }
              if (action.potion) {
                currQuest.potions.elixir.count = action.potion.count;
                if (currQuest.potions.elixir.limit_flg) {
                  currQuest.potions.elixir.limit_remain--;
                }
              }
              hasFormationChanged = true;
              break;
            case "recast":
              if (!isFromPlayer) {
                var pos = currQuest.formation[action.pos];
                currQuest.characters[pos].currCharge = parseInt(action.value);
              }
              break;
            case "die":
              if (!isFromPlayer) {
                var pos = currQuest.formation[action.pos];
                currQuest.characters[pos].currHP = 0;
              }
              break;
            case 'super':
              if (!isFromPlayer) {
                if (action.list) {
                  for (var j = 0; j < action.list.length; j++) {
                    for (var k = 0; k < action.list[j].length; k++) {
                      var pos = currQuest.formation[action.list[j].damage[k].pos];
                      currQuest.characters[pos].currHP = parseInt(action.list[j].damage[k].hp);
                    }
                  }
                }
              }
              isAttack = true;
              break;
            case 'boss_gauge':
              if (currQuest.enemies[action.pos] === null) {
                currQuest.enemies[action.pos] = createEnemy(parseInt(action.hp), parseInt(action.hpmax));
              } else {
                currQuest.enemies[action.pos].currHP = parseInt(action.hp);
                currQuest.enemies[action.pos].maxHP = parseInt(action.hpmax);
              }
              break;
            case 'summon':  
              isSummon = true;
              if (!isFromPlayer) {
                if (action.list !== undefined) {
                  if (action.list.length === 0 || action.list[0].damage.length === 0) {
                    break;
                  }
                  for (var j = 0; j < action.list.length; j++) {
                    for (var k = 0; k < action.list[j].damage.length; k++) {
                      if (syncBossHP) {
                        ignoredEnemyHPValues[action.list[j].damage[k].pos][action.list[j].damage[k].hp] = true;
                      }
                    }
                  }
                }
              }
              break;
            case 'special':
            case 'special_npc':
              if (!isFromPlayer) {
                if (action.list !== undefined) {
                  if (action.list[0].damage.length === 0) {
                    break;
                  }
                  for (var j = 0; j < action.list.length; j++) {
                    for (var k = 0; k < action.list[j].damage.length; k++) {
                      if (syncBossHP) {
                        ignoredEnemyHPValues[action.list[j].damage[k].pos][action.list[j].damage[k].hp] = true;
                      }
                    }
                  }
                }
              }
              isAttack = true;
              isOugi = true;
              break;
            // ability and other damage handler
            case 'damage':
              if (action.list !== undefined) {
                if (isFromPlayer) {
                  for (var j = 0; j < action.list.length; j++) {
                    if (syncBossHP) {
                      ignoredEnemyHPValues[action.list[j].pos][action.list[j].hp] = true;
                    }
                  }
                  isDamage = true;
                } else {
                  for (var j = 0; j < action.list.length; j++) {
                    var pos = currQuest.formation[action.list[j].pos];
                    currQuest.characters[pos].currHP = parseInt(action.list[j].hp);
                  }
                }
              }
              break;
            case 'temporary':
              currQuest.potions.large = action.large;
              currQuest.potions.small = action.small;
              break;
            case 'event_temporary':
              currQuest.potions[action.item_id] = action.number;
              break;
            case 'win':
              currQuest.id = '' + action.raid_id;
              if (action.is_last_raid) {
                currQuest.url = currQuest.url.replace('raid', 'result');
                isWin = true;
                if (Options.Get('skip')) {
                  Message.OpenURL(currQuest.url + currQuest.id, devID);
                  //Message.Post(devID, { 'type': 'openURL', 'data': currQuest.url + currQuest.id });
                }
              }
              isWin = true;
              if (Options.Get('skip') && Options.Get('skipNext')) {
                Message.OpenURL(currQuest.url + currQuest.id, devID);
                //Message.Post(devID, { 'type': 'openURL', 'data': currQuest.url + currQuest.id });
              }
            default:
              break;
          }
        }
      }

      if (!isWin) {
        if ((Options.Get('attackRefresh') && isAttack) || (Options.Get('ougiRefresh') && isOugi) || (Options.Get('summonRefresh') && isSummon)) {
          if (Options.Get('fasterRefresh')) {
            chrome.tabs.sendMessage(devID, { 'type': 'fastRefresh', 'data': true });
          } else {
            Message.OpenURL(currQuest.url + currQuest.id, devID);
            //Message.Post(devID, { 'type': 'openURL', 'data': currQuest.url + currQuest.id });
          }
        }
      }


      if (syncAbilities && json.status && json.status !== null) {
        if (json.status.formation) {
          for (var i = 0; i < currQuest.formation.length; i++) {
            if (currQuest.formation[i] !== json.status.formation[i]) {
              hasFormationChanged = true;
              currQuest.formation = json.status.formation;
              break;
            }
          }
        }

        if (json.status.ability !== undefined) {
          for (var i in json.status.ability) {
            if (!json.status.ability.hasOwnProperty(i)) {
              continue;
            }
            var pos = json.status.ability[i].pos;
            if (currQuest.characters[pos] === null) {
              continue;
            }
            var abilities = json.status.ability[i].list;
            for (var j in abilities) {
              if (!abilities.hasOwnProperty(j)) {
                continue;
              }
              var ability = abilities[j][0];
              if (currQuest.characters[pos].abilities[j - 1] !== null) {
                currQuest.characters[pos].abilities[j - 1].cooldown = parseInt(ability['ability-recast']);
                currQuest.characters[pos].abilities[j - 1].data = ability;
              } else {
                image = skillImageURL + ability.class.match(/ico-ability(\d+_\d+)/i)[1] + '.png';
                currQuest.characters[pos].abilities[j - 1] = createSkill(
                  ability['ability-name'],
                  ability['ability-id'],
                  image,
                  parseInt(ability['ability-recast']),
                  parseInt(ability.duration),
                  parseInt(ability['duration-second']),
                  ability
                );
              }
            }
          }
        }
      }


      if (syncSummons) {
        if (json.status !== undefined && json.status !== null) {
          currQuest.lyria_pos = json.lyria_pos;
          var summonOffCD = false;
          if (json.status.summon !== undefined && json.status.summon !== null) {
            summonCooldowns = [];
            for (var i = 0; i < json.status.summon.recast.length; i++) {
              if (json.status.summon.recast[i] !== null) {
                var recast = parseInt(json.status.summon.recast[i]);
                if (recast === 0) {
                  summonOffCD = true;
                }
                summonCooldowns.push({
                  'turn': recast,
                  'special_once_flag': currQuest.summons[i].onceOnly
                });
              } else {
                summonCooldowns.push({
                  'turn': null,
                  'special_once_flag': false
                });
              }
            }
          }

          if (json.status.supporter !== undefined && json.status.supporter !== null) {
            if (json.status.supporter.recast !== undefined &&
              json.status.supporter.recast !== null) {
              var recast = parseInt(json.status.supporter.recast);
              if (recast === 0) {
                summonOffCD = true;
              }
              summonCooldowns.push({
                'turn': recast,
                'special_once_flag': currQuest.summons[5].onceOnly
              });
            } else {
              summonCooldowns.push({
                'turn': null,
                'special_once_flag': false
              });
            }
          }

          for (var i = 0; i < currQuest.formation.length; i++) {
            var pos = currQuest.formation[i];
            if (currQuest.characters[pos].leader && currQuest.characters[pos].currHP > 0) {
              hasLeader = true;
              break;
            }
          }

          if (currQuest.lyria_num !== -1) {
            if (currQuest.lyria_pos !== -1 && currQuest.characters[currQuest.lyria_num].currHP > 0) {
              canSummon = true;
            }
          } else if (hasLeader) {
            canSummon = true;
          }

          summons = {
            'cooldowns': summonCooldowns,
            'canSummon': canSummon,
            'summon_enable': summonOffCD ? json.status.summon_enable : 0,
            'lyria_pos': currQuest.lyria_pos,
            'lyria_num': currQuest.lyria_num
          };
        }
      }

      if (syncAbilities || syncPlayerHP || syncPlayerFormation) {
        characters = currQuest.characters;
        formation = currQuest.formation;
      }

      if (syncTurns) {
        if (json.status !== undefined && json.status.turn !== undefined) {
          turn = json.status.turn;
        }
      }

      if (syncAbilityTurns) {
        if (json.status && json.status.ability_turn) {
          ability_turn = json.status.ability_turn;
        }
      }

      if (syncPotions) {
        potions = currQuest.potions;
      }

      for (var i = 0; i < currQuest.devIDs.length; i++) {
        if (devID === currQuest.devIDs[i]) {
          chrome.tabs.sendMessage(currQuest.devIDs[i], {
            'type': 'syncClient',
            'data': {
              'type': 'battle',
              'turn': turn,
              'ability_turn': ability_turn,
              'raid_id': currQuest.id,
              'boss': enemies,
              'ignoredEnemyHPValues': ignoredEnemyHPValues,
              'characters': characters,
              'formation': formation,
              'summons': summons,
              'hasFormationChanged': hasFormationChanged,
              'potions': potions
            }
          });
        } else {
          chrome.tabs.sendMessage(currQuest.devIDs[i], {
            'type': 'syncClient',
            'data': {
              'type': 'battle',
              'turn': turn,
              'ability_turn': ability_turn,
              'raid_id': currQuest.id,
              'boss': enemies,
              'ignoredEnemyHPValues': null,
              'characters': characters,
              'formation': formation,
              'summons': summons,
              'hasFormationChanged': hasFormationChanged,
              'potions': potions
            }
          });
        }
      }
    },

    SetCurrentQuest: function (json) {
      // currently unused
      if (json.progress_quest_info !== undefined) {
        var id = '' + json.progress_quest_info[0].raid_id;
        var currQuest = null;
        for (x in quests) {
          if (!quests.hasOwnProperty(x)) continue;
          if (quests[x].id === id) {
            currQuest = quests[x];
          }
        }
        if (currQuest === null) {
          currQuest = createQuest(id, '#raid/');
        } else {
          currQuest.id = id;
          currQuest.url = '#raid/';
        }
      } else {
        delete quests[id];
      }
      setQuestsJQuery(id);
    },

    UseSummon: function(json) {
    },

    Attack: function(json) {
    },

    AbandonQuest: function(payload) {
      var id = '' + payload.raid_id;
      var deleted = false;

      for (var i in quests) {
        if (!quests.hasOwnProperty(i)) continue;
        if (quests[i] !== undefined && quests[i] !== null && quests[i].id === id) {
          delete quests[i];
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        for (var i = 0; i < raids.length; i++) {
          if (raids[i].id === id) {
            raids.splice(i, 1);
            deleted = true;
            break;
          }
        }
      }

      setQuestsJQuery(id);
    },

    CheckJoinedRaids: function(json) {
    },

    SetCoopCode: function(code, devID) {
      Message.Post(devID, {
        'type': 'setClick',
        'data': {
          'id': '#quest-copy',
          'value': code + ' (Co-Op Room) '
        }
      });
      Message.Post(devID, {
        'type': 'setTooltip',
        'data': {
          'id': '#quest-copy',
          'text': code + ' (Co-Op Room) '
        }
      });
    },

    UpdateInProgress: function(json, devID) {
      //var inProgress = json.option.quest.init_list.progress_quest_info;
      //if (inProgress !== undefined && inProgress.length > 0) {
      //  var id = '' + inProgress[0].raid_id;
      //  quests[id] = createQuest(id, '#raid/', devID);
      //}
    },

    CopyTweet: function(json, devID) {
      if (!Options.Get('copyJapaneseName') || !json.twitter || !json.twitter.monster || json.twitter.monster === null) {
        return;
      }

      var monster = json.twitter.monster;
      if (tweetHash[monster] !== undefined) {
        chrome.tabs.sendMessage(devID, { 'type': 'setTweetMessage', 'data': tweetHash[monster] });
      } else if (jpTweetHash[monster] !== undefined) {
        chrome.tabs.sendMessage(devID, { 'type': 'setTweetMessage', 'data': jpTweetHash[monster] });
      }
    },

    CheckSpecialQuest: function(json) {
      if (json.appearance !== undefined && json.appearance !== null) {
        if (json.appearance.is_quest !== undefined && json.appearance.is_quest !== null) {
          Message.PostAll({
            'type': 'setAlert',
            'data': {
              'id': '#alert',
              'time': 10000,
              'text': json.appearance.quest_name + ' has appeared!'
            }
          })
        }
      }
    },

    CheckOugiToggle: function (payload, devID) {
      if (payload.set ==='special_skill') {
        chrome.tabs.sendMessage(devID, { 'type': 'checkOugiToggle', 'data': payload.value });
      };
    },

    CopyCoopCode: function (json) {
      if (!Options.Get('autoCopyCodes') || json === undefined || json === null) {
        return;
      }
      if (json.data === undefined || json.data === null) {
        return;
      }
      var uri = decodeURIComponent(json.data);
      var code = /\"txt\-room\-id\"\>(([A-F]|\d){5,6})/g.exec(uri);
      if (code !== null) {
        copy(code[1]);
      }
    },

    CopyRaidCode: function (json) {
      if (!Options.Get('autoCopyCodes') || json === undefined || json === null) {
        return;
      }
      if (!json.twitter || !json.twitter.battle_id || json.twitter.battle_id === null) {
        return;
      }
      copy(json.twitter.battle_id);
    }
  };

  var setQuestsJQuery = function(id) {
    var image;
    var url;
    if (quests[id] !== undefined && quests[id] !== null) {
      image = quests[id].image;
      url   = quests[id].url + quests[id].id;
    } else {
      image = blankIcon;
      url   = '';
    }

    Message.PostAll({
      'type': 'setImage',
      'data': {
        'id':    '#quest-image-curr',
        'value': image
      }
    });
    Message.PostAll({
      'type': 'setClick',
      'data': {
        'id':    '#quest-image-curr',
        'value': url
      }
    });

    for (var i = 0; i < 4; i++) {
      if (i < raids.length) {
        image = raids[i].image;
        url   = raids[i].url + raids[i].id;
      } else {
        image = blankIcon;
        url   = '';
      }
      Message.PostAll({
        'type': 'setImage',
        'data': {
          'id': '#quest-image-' + i,
          'value': image
        }
      });
      Message.PostAll({
        'type': 'setClick',
        'data': {
          'id': '#quest-image-' + i,
          'value': url
        }
      });
    }
  };

  var hideBattleJQuery = function(currQuest, isHidden) {
  };

  var setBattleJQuery = function(currQuest) {
    var devID;
    for (var k = 0; k < currQuest.devIDs.length; k++) {
      devID = currQuest.devIDs[k];
      if (!Message.Post(devID, undefined)) {
        currQuest.devIDs.splice(k, 1);
        k--;
      } else {
        for (var i = 0; i < 4; i++) {
          if (currQuest.characters[pos] !== null && i < currQuest.formation.length) {
            var pos = currQuest.formation[i];
            Message.Post(devID, {
              'type': 'hideObject',
              'data': {
                'id': '#quest-character-' + i,
                'value': false
              }
            });
            Message.Post(devID, {
              'type': 'setImage',
              'data': {
                'id': '#quest-character-image-' + i,
                'value': currQuest.characters[pos].image
              }
            });
            for (var j = 0; j < currQuest.characters[pos].abilities.length; j++) {
              if (currQuest.characters[pos].abilities[j] !== null) {
                Message.Post(devID, {
                  'type': 'hideObject',
                  'data': {
                    'id': '#quest-skill-' + i + '-' + j,
                    'value': false
                  }
                });
                Message.Post(devID, {
                  'type': 'setImage',
                  'data': {
                    'id': '#quest-skill-image-' + i + '-' + j,
                    'value': currQuest.characters[pos].abilities[j].image
                  }
                });
                if (currQuest.characters[pos].abilities[j].cooldown === 0) {
                  Message.Post(devID, {
                    'type': 'setText',
                    'data': {
                      'id': '#quest-skill-text-' + i + '-' + j,
                      'value': ''
                    }
                  });
                  Message.Post(devID, {
                    'type': 'setOpacity',
                    'data': {
                      'id': '#quest-skill-image-' + i + '-' + j,
                      'value': 1
                    }
                  });
                } else {
                  Message.Post(devID, {
                    'type': 'setText',
                    'data': {
                      'id': '#quest-skill-text-' + i + '-' + j,
                      'value': currQuest.characters[pos].abilities[j].cooldown
                    }
                  });
                  Message.Post(devID, {
                    'type': 'setOpacity',
                    'data': {
                      'id': '#quest-skill-image-' + i + '-' + j,
                      'value': .4
                    }
                  });
                }
              } else {
                Message.Post(devID, {
                  'type': 'hideObject',
                  'data': {
                    'id': '#quest-skill-' + i + '-' + j,
                    'value': true
                  }
                });
              }
            }
          } else {
            Message.Post(devID, {
              'type': 'hideObject',
              'data': {
                'id': '#quest-character-' + i,
                'value': true
              }
            });
          }
        }
        for (var i = 0; i < currQuest.enemies.length; i++) {
          if (currQuest.enemies[i] !== null) {
            Message.Post(devID, {
              'type': 'hideObject',
              'data': {
                'id': '#quest-enemy-' + i,
                'value': false
              }
            });
            Message.Post(devID, {
              'type': 'setImage',
              'data': {
                'id': '#quest-enemy-image-' + i,
                'value': currQuest.enemies[i].image
              }
            });
          } else {
            Message.Post(devID, {
              'type': 'hideObject',
              'data': {
                'id': '#quest-enemy-' + i,
                'value': true
              }
            });
          }
        }
        for (var i = 0; i < currQuest.summons.length; i++) {
          if (currQuest.summons[i] !== null) {
            Message.Post(devID, {
              'type': 'setImage',
              'data': {
                'id':    '#quest-summon-image-' + i,
                'value': currQuest.summons[i].image
              }
            });
            if (currQuest.summons[i].cooldown === 0) {
              Message.Post(devID, {
                'type': 'setText',
                'data': {
                  'id':    '#quest-summon-text-' + i,
                  'value': ''
                }
              });
              Message.Post(devID, {
                'type': 'setOpacity',
                'data': {
                  'id': '#quest-summon-image-' + i,
                  'value': 1
                }
              });
            } else {
              Message.Post(devID, {
                'type': 'setText',
                'data': {
                  'id':   '#quest-summon-text-' + i,
                  'value': currQuest.summons[i].cooldown
                }
              });
              Message.Post(devID, {
                'type': 'setOpacity',
                'data': {
                  'id':    '#quest-summon-image-' + i,
                  'value': .6
                }
              });
            }
          } else {
            Message.Post(devID, {
              'type': 'setImage',
              'data': {
                'id':    '#quest-summon-image-' + i,
                'value': blankIcon
              }
            });
            Message.Post(devID, {
              'type': 'setText',
              'data': {
                'id':    '#quest-summon-text-' + i,
                'value': ''
              }
            });
          }
        }
      }
    }
  };

  var parseQuestID = function(url) {
    return url.substring(url.indexOf('data/') + 5, url.lastIndexOf('/'));
  };

  var setRemainingRaids = function(id, amount) {
    if (remainingQuests[id] !== undefined) {
      if (amount < 0) {
        amount = 0;
      }

      if (remainingQuests[id] !== amount && amount <= 0) {
        var currIndex = currRaidList.indexOf(id);
        currRaidList.splice(currIndex, 1);
        var found = false;
        for (var i = 0; i < completedRaidList.length; i++) {
          if (!Options.Get('sortRaidsDifficulty')) {
            if (raidInfo[id].sequence < raidInfo[completedRaidList[i]].sequence) {
              completedRaidList.splice(i, 0, id);
              found = true;
              break;
            }
          } else {
            if (raidInfo[id].sequence2 < raidInfo[completedRaidList[i]].sequence2) {
              completedRaidList.splice(i, 0, id);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          completedRaidList.push(id);
        }
      } else if (remainingQuests[id] !== amount && amount > 0 && completedRaidList.indexOf(id) !== -1) {
        var currIndex = completedRaidList.indexOf(id);
        completedRaidList.splice(currIndex, 1);
        var found = false;
        for (var i = 0; i < currRaidList.length; i++) {
          if (!Options.Get('sortRaidsDifficulty')) {
            if (raidInfo[id].sequence < raidInfo[currRaidList[i]].sequence) {
              currRaidList.splice(i, 0, id);
              found = true;
              break;
            }
          } else {
            if (raidInfo[id].sequence2 < raidInfo[currRaidList[i]].sequence2) {
              currRaidList.splice(i, 0, id);
              found = true;
              break;
            }
          }
        }
        if (!found) {
          currRaidList.push(id);
        }
      }

      remainingQuests[id] = amount;
      setRemainingJquery(id);
    }
  };

  var setRemainingJquery = function(id) {
    if (!Options.Get('isMagFest')) {
      Message.PostAll({
        'type': 'setText',
        'data': {
          'id':    '#remaining-' + id,
          'value': remainingQuests[id] + '/' + raidInfo[id].max
        }
      });
    } else {
      Message.PostAll({
        'type': 'setText',
        'data': {
          'id':    '#remaining-' + id,
          'value': remainingQuests[id] + '/' + (raidInfo[id].max + raidInfo[id].magDelta)
        }
      });
    }

    if (Options.Get(id)) {
      Message.PostAll({
        'type': 'hideObject',
        'data': {
          'id': '#daily-raid-' + id,
          'value': false
        }
      });
    } else {
      Message.PostAll({
        'type': 'hideObject',
        'data': {
          'id': '#daily-raid-' + id,
          'value': true
        }
      });
    }

    if (remainingQuests[id] !== 0) {
      for (var i = 0; i < currRaidList.length; i++) {
        if (!Options.Get('sortRaidsDifficulty')) {
          if (raidInfo[id].sequence < raidInfo[currRaidList[i]].sequence && Options.Get(currRaidList[i])) {
            Message.PostAll({
              'type': 'beforeObject',
              'data': {
                'id': '#daily-raid-' + id,
                'target': '#daily-raid-' + currRaidList[i]
              }
            });
            return;
          }
        } else {
          if (raidInfo[id].sequence2 < raidInfo[currRaidList[i]].sequence2 && Options.Get(currRaidList[i])) {
            Message.PostAll({
              'type': 'beforeObject',
              'data': {
                'id': '#daily-raid-' + id,
                'target': '#daily-raid-' + currRaidList[i]
              }
            });
            return;
          }
        }
      }

      Message.PostAll({
        'type': 'appendObject',
        'data': {
          'id': '#daily-raid-' + id,
          'target': '#daily-raid-list'
        }
      });
      return;
    } else {
      for (var i = 0; i < completedRaidList.length; i++) {
        if (!Options.Get('sortRaidsDifficulty')) {
          if (raidInfo[id].sequence < raidInfo[completedRaidList[i]].sequence && Options.Get(completedRaidList[i])) {
            Message.PostAll({
              'type': 'beforeObject',
              'data': {
                'id':     '#daily-raid-' + id,
                'target': '#daily-raid-' + completedRaidList[i]
              }
            });
            return;
          }
        } else {
          if (raidInfo[id].sequence2 < raidInfo[completedRaidList[i]].sequence2 && Options.Get(completedRaidList[i])) {
            Message.PostAll({
              'type': 'beforeObject',
              'data': {
                'id':     '#daily-raid-' + id,
                'target': '#daily-raid-' + completedRaidList[i]
              }
            });
            return;
          }
        }
      }
      Message.PostAll({
        'type': 'appendObject',
        'data': {
          'id':     '#daily-raid-' + id,
          'target': '#completed-raid-list'
        }
      });
      return;
    }
  };

  var saveRemainingRaids = function() {
    Storage.Set('quests', remainingQuests);
  };

  var sortRaids = function(byDifficulty) {
    var sort;
    if (!byDifficulty) {
      sort = sortByElement;
    } else {
      sort = sortByDifficulty;
    }

    raidList.sort(sort);
    currRaidList.sort(sort);
    completedRaidList.sort(sort);

    for (var i = 0; i < raidList.length; i++) {
      Message.PostAll({
        'type': 'hideObject',
        'data': {
          'id':    '#daily-raid-' + raidList[i],
          'value': true
        }
      });
    }

    for (var i = 0; i < currRaidList.length; i++) {
      var id = currRaidList[i];
      if (Options.Get(id)) {
        Message.PostAll({
          'type': 'hideObject',
          'data': {
            'id':    '#daily-raid-' + id,
            'value': false
          }
        });
        Message.PostAll({
          'type': 'appendObject',
          'data': {
            'id':     '#daily-raid-' + id,
            'target': '#daily-raid-list'
          }
        });
      }
    }

    for (var i = 0; i < completedRaidList.length; i++) {
      var id = completedRaidList[i];
      if (Options.Get(id)) {
        Message.PostAll({
          'type': 'hideObject',
          'data': {
            'id':    '#daily-raid-' + id,
            'value': false
          }
        });
        Message.PostAll({
          'type': 'appendObject',
          'data': {
            'id':     '#daily-raid-' + id,
            'target': '#completed-raid-list'
          }
        });
      }
    }
  };

  var copy =  function(str) {
    var input = document.createElement('textarea');
    document.body.appendChild(input);
    input.value = str;
    input.focus();
    input.select();
    document.execCommand('Copy');
    input.remove();
  };

})();
