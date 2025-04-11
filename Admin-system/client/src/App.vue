<script setup>
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <router-view />
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: Arial, Helvetica, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

#app {
  height: 100%;
}

/* 清除滚动条 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
