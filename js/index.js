new Vue({
  el: '#wang-zhe',
  filters: {
    formatTime(time, format = '/') {
      return `${time.substring(5, 7)}${format}${time.substring(8, 10)}`;
    },
  },
  data() {
    return {
      isActive: false,
      activeKey: 1760,
      heroTypeKey: 0,
      videoKey: 0,
      tagList: [
        { key: 1760, name: '热门' },
        { key: 1761, name: '新闻' },
        { key: 1762, name: '公告' },
        { key: 1763, name: '活动' },
        { key: 1764, name: '赛事' },
      ],
      heroTypeList: [
        { key: 0, type: '热门' },
        { key: 1, type: '战士' },
        { key: 2, type: '法师' },
        { key: 3, type: '坦克' },
        { key: 4, type: '刺客' },
        { key: 5, type: '射手' },
        { key: 6, type: '辅助' },
      ],
      videoList: [
        {
          key: 0,
          type: '精品栏目',
          id: '1809,1855,2609,4781,4782,4780,4646',
        },
        { key: 1, type: '英雄攻略' },
        {
          key: 2,
          type: '赛事精品',
          id: '1639,1852,4784,4785,4786,4787,4775',
        },
      ],
      newsList: [],
      hotHeroData: [],
      allHeroData: [],
      videoData: [],
      sliderPic: [],
    };
  },
  created() {
    this.getNews(this.activeKey);
    this.getHeros(this.heroTypeList[0]);
    this.getBoutiquePrograma(this.videoList[0]);
    this.getSliderPic();
  },
  computed: {
    heroArrList() {
      const hotHeroList = this.hotHeroData.map((item) => {
        return this.allHeroData.filter((allitem) => {
          return allitem.ename == item.heroid;
        })[0];
      });
      return this.heroTypeKey != 0
        ? this.allHeroData.filter((item) => {
            return (
              item.hero_type == this.heroTypeKey ||
              item.hero_type2 == this.heroTypeKey
            );
          })
        : hotHeroList;
    },
  },
  methods: {
    // 获取新闻资讯数据
    getNews(id) {
      const obj = {
        p0: 18,
        p1: 'searchNewsKeywordsList',
        page: 1,
        order: 'sIdxTime',
        r0: 'cors',
        r1: 'NewsObj',
        type: 'iTarget',
        pagesize: 5,
        id,
      };
      axios
        .post('http://192.168.1.104:3000/api/wzry/getNews', obj)
        .then((result) => {
          this.activeKey = id;
          this.newsList = result.data.msg.result;
        });
    },

    // 获取英雄列表数据
    getHeros(item) {
      const hotAxios = axios.get('./assets/top_heros.json');
      const herosAxios = axios.get(
        'http://192.168.1.104:3000/api/wzry/getHeroList'
      );
      Promise.all([hotAxios, herosAxios])
        .then(([hotHero, allHero]) => {
          this.hotHeroData = hotHero.data;
          this.allHeroData = allHero.data;
        })
        .catch((err) => {
          console.log(err);
        });
    },

    // 选择新闻资讯种类
    chooseNewsName(e, t) {
      const eMap = {
        1761: ['新闻', 'new'],
        1762: ['公告', 'announcement'],
        1763: ['活动', 'activity'],
        1764: ['赛事', 'match'],
      };
      const tMap = {
        655: ['新闻', 'new'],
        656: ['公告', 'announcement'],
        1139: ['活动', 'activity'],
        658: ['赛事', 'match'],
      };
      const id = Object.keys(tMap).find((id) => t.includes(id));
      return eMap[e] || tMap[id] || ['热门', 'hot'];
    },

    // 获取精品栏目、赛事精品(或新闻资讯接口)接口数据
    // 精品栏目id‘1809,1855,2609,4781,4782,4780,4646’
    // 赛事精品id‘1639,1852,4784,4785,4786,4787,4775’
    getBoutiquePrograma({ id, key: index }) {
      index == 1 ? this.getCross() : this.getBoutique(id);
      this.videoKey = index;
    },

    getBoutique(id) {
      const boutiqueObj = {
        p0: 18,
        p1: 'searchKeywordsList',
        page: 1,
        pagesize: 4,
        order: 'sIdxTime',
        r0: 'cors',
        r1: 'userObj',
        source: 'app_search',
        id,
        type: 'iTag',
      };
      axios
        .post('http://192.168.1.104:3000/api/wzry/getNews', boutiqueObj)
        .then((result) => (this.videoData = result.data.msg.result))
        .catch((err) => {
          console.log(err);
        });
    },
    getCross() {
      const crossObj = {
        serviceId: 18,
        typeids: 2,
        sortby: 'sIdxTime',
        tagids: '2543,619',
        limit: 4,
        source: 'web_m',
        filter: 'tag',
      };
      axios
        .post('http://192.168.1.104:3000/api/wzry/getCross', crossObj)
        .then((result) => (this.videoData = result.data.data.items))
        .catch((err) => {
          console.log(err);
        });
    },

    // 获取轮播图片数据
    getSliderPic() {
      axios
        .get('./assets/info_new_15223.json')
        .then((result) => {
          this.sliderPic = Object.values(result.data);
          this.$nextTick(() => {
            new Swiper('.swiper-container', {
              autoplay: true,
              loop: true,
              pagination: {
                el: '.swiper-pagination',
              },
            });
          });
        })
        .catch((e) => {
          console.log(e);
        });
    },

    // 打开英雄介绍
    openHeroDetail(id) {
      location.href = `/hero.html?id=${id}`;
    },
  },
});
