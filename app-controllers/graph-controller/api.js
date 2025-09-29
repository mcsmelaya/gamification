const express = require('express');
const app = express();
const PORT = 2766;

// TODO: fetch data from sabina api
// TODO: get method from our api with included sections

app.use(express.json());

const labs = {
  "aisd": {
    "List": ["О, массив", "Лист, покажись", "Секвенсор", "Сегментатор-3000", "Мастер базы"],
    "Queue": ["Подвинься", "Дайте приоритет", "Деконструктор", "СегменДек", "Очередник"],
    "Vector": ["Квадрат малевича", "Вектор-пакет", "МногоМногочлен(Вектор)", "Измерь меня полностью", "Я у мамы инженер многомерных структур"],
    "Matrix": ["Детерминант судьбы", "Генеральный шаблон", "Магистр Матриц", "Высший матриарх", "Специалист по матричной типизации"],
    "HashMap": ["Инвертни это!", "Давай заново", "Просеял-победил", "Фильтруй-не тормози", "Повелитель линейных алгоритмов"],
    "Recursion": ["Башня для продвинутых", "Вектор-пакет", "МногоМногочлен(Рекурсия)", "Измерь меня полностью", "Властелин рекурсии"],
    "Sort": ["Полуупорядоченный", "Вектор-пакет-сорт", "МногочленМного(Сорт)", "Измерь меня полностью(сорт)", "Логик порядка"],
    "Function": ["Кусок графика", "Пакет-вектор", "МногочленМного(функции)", "Измерь меня полностью(функции)", "Аналитик функций"],
  },
  "metatheory": {
  }
}

// обрабатываем полученные данные
function getUnlockedAchievements(achievements, labs) {
  const result = {};

  // Перебираем каждый трек (aisd, metatheory и т.д.)
  for (const trackName in achievements) {
    const trackAchievements = achievements[trackName];
    const labList = labs[trackName] || {}; // Список лаб для этого трека

    // Обрабатываем каждую ачивку в треке
    for (const key in trackAchievements) {
      const value = trackAchievements[key];

      // 1. Если ачивка — булева и true (например, "Первое появление": true)
      if (typeof value === 'boolean' && value === true) {
        result[key] = true;
      }

      // 2. Если ачивка — это лабораторная (числовое значение: оценка)
      if (typeof value === 'number' && value > 0) {
        // Проверяем, есть ли такая лаба в labs[trackName]
        if (labList[key]) {
          const achList = labList[key]; // массив ачивок для этой лабы
          const count = Math.min(value, achList.length); // не больше длины массива

          // Добавляем первые `count` ачивок
          for (let i = 0; i < count; i++) {
            result[achList[i]] = true;
          }
        }
      }
    }
  }

  return result;
}

// TODO: добавить логирование
app.post('/api/v1/students/update/:id', async (req, res) => {
  const achievements = req.body;
  const studentId = parseInt(req.params.id, 10);

  console.log('\n==============> Обновляем граф студента...')
  console.log(`Получены ачивки для студента ${studentId}`);
  console.log('achievements:', JSON.stringify(achievements, null, 2));
  console.log('==============>\n')

  // формируем информацию о вершинах графа
  const nodes = getUnlockedAchievements(achievements, labs)

  console.log('\n==============> Получаем список достигнутых достижений...')
  console.log('Вершины достижений: ', nodes)
  console.log('==============>\n')

  // обновляем информацию о графе
  // try { 
  //   await fetch(`http://${graphApi}/api/v1/students/update/${studentId}/`, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json'
  //     },
  //     body: JSON.stringify(nodes)
  //   });
  //   console.log('Информация о вершинах для студента успешно отправлена')
  // } catch (error) {
  //   console.error('Не удалось отправить информацию')
  // }

  res.status(200).json({ message: "Информация о вершинах получена", received: true }); // возвращаем ответ
});

// TODO: добавить логирование
app.get('/api/v1/students/info/:id', async (req, res) => {
  const studentId = parseInt(req.params.id, 10);

  const apiUrl = `http://${graphApi}/api/v1/students/info/${studentId}/`; // апи компонента графа
  const response = await fetch(apiUrl);

  if (response.ok) {
      const studentData = await response.json(); // получаем информацию о графе
      console.log(`Данные о вершинах с API для ID ${id}:`, JSON.stringify(studentData, null, 2));

      if (!studentData) {
        return res.json({
          message: "Данные не получены",
          student: null,
          achievements: null
        });
      }

    } else {
      console.warn(`API вернул статус ${response.status} для ID ${id}`);
      console.log(`Ответ:`, await response.text());
    }

  return res.json(response.json()); // возвращаем информацию о графе
});

app.listen(PORT, 'localhost', () => {
  console.log(`API запущено на http://localhost:${PORT}`);
  console.log(`GET http://localhost:${PORT}/api/v1/students/info/1`); // получаем информацию о вершинах графа достижений
  console.log(`POST http://localhost:${PORT}/api/v1/students/update/1`) // обновляем информмацию о вершинах графа достижений
});