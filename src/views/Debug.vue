<template>
  <div class="debug-page">
    <h2>调试信息</h2>
    <div class="debug-info">
      <h3>认证状态</h3>
      <p>Token: {{ authStore.token ? '存在' : '不存在' }}</p>
      <p>用户: {{ authStore.user ? '存在' : '不存在' }}</p>
      <p>角色: {{ authStore.role }}</p>
      <p>已认证: {{ authStore.isAuthenticated ? '是' : '否' }}</p>
      <p>是教师: {{ authStore.isTeacher ? '是' : '否' }}</p>
      <p>是学生: {{ authStore.isStudent ? '是' : '否' }}</p>
    </div>
    
    <div class="debug-info">
      <h3>LocalStorage</h3>
      <p>Token: {{ localStorage.getItem('token') || '不存在' }}</p>
      <p>User: {{ localStorage.getItem('user') || '不存在' }}</p>
      <p>Role: {{ localStorage.getItem('role') || '不存在' }}</p>
    </div>
    
    <div class="debug-actions">
      <el-button @click="clearAuth">清除认证</el-button>
      <el-button @click="refreshPage">刷新页面</el-button>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const clearAuth = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  localStorage.removeItem('role')
  window.location.reload()
}

const refreshPage = () => {
  window.location.reload()
}
</script>

<style scoped>
.debug-page {
  padding: 20px;
}

.debug-info {
  margin: 20px 0;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.debug-actions {
  margin-top: 20px;
}

.debug-actions .el-button {
  margin-right: 10px;
}
</style>
