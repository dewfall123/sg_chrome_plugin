<style scoped>
    .index {
        width: 100%;
        min-width: 380px;
        min-height: 300px;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        text-align: center;
    }

    .index h1 {
        height: 150px;
    }

    .index h1 img {
        height: 100%;
    }

    .index h2 {
        color: #666;
        margin-bottom: 200px;
    }

    .index h2 p {
        margin: 0 0 50px;
    }

    .index .ivu-row-flex {
        height: 100%;
    }

    .text-input {
        min-width: 360px;
    }
</style>
<template>
    <div class="index">
        <Row type="flex" justify="center" >
            <Col span="24" class="text-input">
                <Input v-model="text"  type="textarea" placeholder="待替换的文本"></Input>
                <Input v-model="replacedText"  type="textarea" placeholder="替换的结果"></Input>
                <Button type="text" @click="addShow = !addShow">添加</Button>
                {{typeof shiledWords}}
                {{shiledWords}}
                <Input v-model="shiledWords"  type="textarea" placeholder="当前屏蔽词"></Input>
                <Input v-model="theAddWords" v-show="addShow" type="textarea" placeholder="添加的屏蔽词"></Input>
                <Button type="text" @click="saveWordsLocal">保存</Button>
            </Col>
        </Row>
    </div>
</template>
<script>
    import Util from '../libs/util';

    export default {
        data() {
            return {
                text: '',
                myWords: '',
                theAddWords: '',
                addShow: true,
                nameTags: {},
            }
        },
        computed: {
            shiledWords: function () {
                const defaultWords = ['习'];
                return defaultWords.concat(this.myWords).filter((i) => {return i;});
            },
            replacedText: function() {
                let textArr = this.text.split('');
                for (let i in textArr) {
                    if (this.shiledWords.indexOf(textArr[i]) >= 0) {
                        textArr[i] = Util.py(textArr[i]);
                    }
                }
                return textArr.join('');
            }
        },
        methods: {
            saveWordsLocal() {
                let addWords = this.theAddWords.split('');
                addWords = addWords.concat(this.myWords);
                chrome.storage.sync.set({words: [...new Set(addWords)]}, () => {
                    this.$Message.success('保存成功' + addWords);
                    this.theAddWords = '';
                    this.getWordLocal();
                });
            },
            getWordLocal() {
                chrome.storage.sync.get(['words'], (items) => {
                    this.myWords = items.words;
                });
            },
            getNameTag() {
                chrome.storage.sync.get(['nameTag'], (items) => {
                    this.nameTag = items.nameTag;
                });
            },
            setNameTag () {
                chrome.storage.sync.set({words: addWords}, () => {
                    this.$Message.success('保存成功');
                    this.theAddWords = '';
                    this.getNameTag();
                });
            }
        },
        created() {
            this.getWordLocal();
        }
    };
</script>