new Vue({
  el: '#hero-list',
  data() {
    return {
      info: { desc: {} },
      heroName: '',
      titleKey: 1,
      abilityKey: 0,
      heroDataList: {},
      itemDataList: [],
      mingDataList: [],
      sumDataList: [],
      videoData: [],
      loc: {
        1: '战士',
        2: '法师',
        3: '坦克',
        4: '刺客',
        5: '射手',
        6: '辅助',
      },
      desc: [
        { key: 0, attr: 4, type: '难度', ename: 'difficulty' },
        { key: 1, attr: 3, type: '技能', ename: 'ability' },
        { key: 2, attr: 2, type: '攻击', ename: 'attack' },
        { key: 3, attr: 1, type: '生存', ename: 'survival' },
      ],
      title: [
        { class: '1', type: '英雄初识' },
        { class: '2', type: '进阶攻略' },
      ],
      mainUp: {
        0: ['主升', 'main'],
        1: ['副升', 'sub'],
      },
      equ: {
        0: '顺风出装',
        1: '逆风出装',
      },
      panelTitle: {
        0: '使用技巧',
        1: '对抗技巧',
        2: '团战思路',
      },
      relTitle: ['最佳搭档', '被谁克制', '克制谁'],
    };
  },
  created() {
    this.getHeroDetail();
  },
  computed: {
    location() {
      return (
        this.info &&
        this.info.location &&
        this.info.location
          .split('/')
          .filter((val) => val)
          .map((val) => this.loc[val])
          .join('/')
      );
    },
    skinName() {
      return escape(this.info?.skinName);
    },
    skinLen() {
      return this.info?.skinName?.split('|').length;
    },
    nameArr() {
      const mainName = this.heroDataList?.abilityIntro?.filter(
        (ele) => ele.skillId == this.heroDataList.upAbility.main
      );
      const viceName = this.heroDataList?.abilityIntro?.filter(
        (ele) => ele.skillId == this.heroDataList.upAbility.vice
      );
      return mainName?.concat(viceName);
    },
    summoner() {
      return this.heroDataList?.upAbility?.summoner.split('|');
    },
    sumName() {
      return this.summoner?.map((ele) =>
        this.sumDataList
          ?.filter((elem) => ele == elem.summoner_id)
          .map((item) => item.summoner_name)
      );
    },
    equipment() {
      return this.heroDataList?.equipment?.map((ele) => ele.split('|'));
    },
    mingList() {
      return this.heroDataList?.ming?.split('|');
    },
    abilityIntro() {
      return this.heroDataList.abilityIntro;
    },
    skill() {
      return this.heroDataList.skill;
    },
    relation() {
      return this.heroDataList.relation;
    },
  },
  methods: {
    // 获取英雄详情
    getHeroDetail() {
      const obj = {
        id: this.querySearchParameter('id'),
      };
      const heroInfo = axios.post(
        'http://192.168.1.104:3000/api/wzry/getHeroDetail',
        obj
      );
      const item = axios.get('./assets/item.json');
      const ming = axios.get('./assets/ming.json');
      const summoner = axios.get('./assets/summoner.json');
      Promise.all([heroInfo, item, ming, summoner])
        .then(([heroData, itemData, mingData, sumData]) => {
          this.info = heroData.data.heroInfo;
          this.heroName = this.info.name;
          this.heroDataList = heroData.data;
          this.itemDataList = itemData.data;
          this.mingDataList = mingData.data;
          this.sumDataList = sumData.data;
          this.$nextTick(() => {
            this.$refs.content.style.height =
              this.$refs.list1.scrollHeight + 'px';
          });
          this.getForward();
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 获取页面href的search值
    querySearchParameter(param) {
      const arr = location.search.substring(1).split('&');
      let result = '';
      for (let item of arr) {
        const [key, value] = item.split('=');
        if (key === param) {
          result = value;
          break;
        }
      }
      return result;
    },
    // 转换列表
    toggleList(item) {
      this.titleKey = item.class;
      this.$refs.content.style.height =
        item.class == 1
          ? this.$refs.list1.scrollHeight + 'px'
          : this.$refs.list2.scrollHeight + 'px';
    },
    // 切换技能介绍
    toggleAbility(index) {
      this.abilityKey = index;
    },

    // 获取进阶攻略数据
    getForward() {
      const video = jsonp(
        '//ams.qq.com/wmp/data/js/v3/WMP_PVP_WEBSITE_NEWBEE_DATA_V1.js',
        {
          param: 'callbackparam',
          name: 'newbee_hero_list_callback',
        }
      );
      const news = jsonp(
        '//ams.qq.com/wmp/data/js/v3/WMP_PVP_WEBSITE_DATA_18_V3.js',
        {
          param: 'callbackparam',
          name: 'web_hero_list_v3',
        }
      );
      Promise.all([video, news])
        .then(([videoData, newsData]) => {
          const videoDataArr = videoData.video[this.heroName].filter(
            (ele, index) => index >= videoData.video[this.heroName].length - 2
          );
          const newsDataArr = Object.values(newsData).find(
            (ele) => ele.sTag == this.heroName
          ).jData;
          this.videoData = videoDataArr.concat(newsDataArr);
        })
        .catch((err) => {
          console.log(err);
        });
    },

    mingName(ele) {
      return this.mingDataList
        ?.filter((mingEle) => mingEle.ming_id == ele)
        .map((mapEle) => [mapEle.ming_name, mapEle.ming_des])[0][0];
    },

    mingText(ele) {
      return this.mingDataList
        ?.filter((mingEle) => mingEle.ming_id == ele)
        .map((mapEle) => [mapEle.ming_name, mapEle.ming_des])[0][1];
    },

    // 装备名字
    equName(ele) {
      return this.itemDataList
        ?.filter((filEle) => filEle.item_id == ele)
        .map((mapEle) => mapEle.item_name)[0];
    },
  },
});
