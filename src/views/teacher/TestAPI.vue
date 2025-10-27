<template>
  <div class="test-api-page">
    <h2>API测试页面</h2>
    
    <el-card class="test-card">
      <template #header>
        <span>学生API测试</span>
      </template>
      
      <el-button @click="testStudentsAPI" :loading="testingStudents">
        测试学生API
      </el-button>
      
      <div v-if="studentsResult" class="result">
        <h4>学生数据结果:</h4>
        <pre>{{ JSON.stringify(studentsResult, null, 2) }}</pre>
      </div>
    </el-card>
    
    <el-card class="test-card">
      <template #header>
        <span>课程API测试</span>
      </template>
      
      <el-button @click="testCoursesAPI" :loading="testingCourses">
        测试课程API
      </el-button>
      
      <div v-if="coursesResult" class="result">
        <h4>课程数据结果:</h4>
        <pre>{{ JSON.stringify(coursesResult, null, 2) }}</pre>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getStudents, getCourses } from '@/utils/api'

const testingStudents = ref(false)
const testingCourses = ref(false)
const studentsResult = ref(null)
const coursesResult = ref(null)

const testStudentsAPI = async () => {
  testingStudents.value = true
  try {
    const response = await getStudents({ per_page: 10 })
    studentsResult.value = response.data
    ElMessage.success('学生API测试成功')
  } catch (error) {
    console.error('学生API测试失败:', error)
    ElMessage.error('学生API测试失败: ' + (error.response?.data?.message || error.message))
    studentsResult.value = { error: error.message }
  } finally {
    testingStudents.value = false
  }
}

const testCoursesAPI = async () => {
  testingCourses.value = true
  try {
    const response = await getCourses({ per_page: 10 })
    coursesResult.value = response.data
    ElMessage.success('课程API测试成功')
  } catch (error) {
    console.error('课程API测试失败:', error)
    ElMessage.error('课程API测试失败: ' + (error.response?.data?.message || error.message))
    coursesResult.value = { error: error.message }
  } finally {
    testingCourses.value = false
  }
}
</script>

<style scoped>
.test-api-page {
  padding: 20px;
}

.test-card {
  margin-bottom: 20px;
}

.result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.result pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow-y: auto;
}
</style>
