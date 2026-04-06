// src/composables/useQuestions.ts
import { ref, readonly } from 'vue'
import type { Question, Option } from '@/types/game'
import { BASE_URL } from '@/config'

export function useQuestions() {
  const questions = ref<Question[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Функция для случайного перемешивания массива
  const shuffleArray = <T>(array: T[]): T[] => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  // Функция для перемешивания вариантов ответа
  const shuffleOptions = (options: Option[]): Option[] => {
    const shuffled = shuffleArray(options)
    const newIds: ('A' | 'B' | 'C' | 'D')[] = ['A', 'B', 'C', 'D']
    return shuffled.map((opt, index) => ({
      ...opt,
      id: newIds[index],
    }))
  }

  // Загрузка вопросов
  const loadQuestions = async (): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`${BASE_URL}data/questions.json`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!Array.isArray(data)) {
        throw new Error('Файл должен содержать массив вопросов')
      }

      if (data.length === 0) {
        throw new Error('Файл не содержит вопросов')
      }

      // Перемешиваем варианты в каждом вопросе
      questions.value = data.map((q: Question) => ({
        ...q,
        options: shuffleOptions(q.options),
      }))

      console.log(`✅ Загружено ${questions.value.length} вопросов`)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ошибка загрузки'
      console.error('❌ Ошибка загрузки вопросов:', err)
      questions.value = []
    } finally {
      isLoading.value = false
    }
  }

  const getQuestion = (index: number): Question | null => questions.value[index] || null
  const totalQuestions = (): number => questions.value.length
  const isLastQuestion = (index: number): boolean => index === questions.value.length - 1

  return {
    questions: readonly(questions),
    isLoading: readonly(isLoading),
    error: readonly(error),
    loadQuestions,
    getQuestion,
    totalQuestions,
    isLastQuestion,
  }
}
