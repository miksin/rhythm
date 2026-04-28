import { generateExercise } from '@/lib/rhythm-engine/generator';
import { ExerciseSheet } from '@/components/ExerciseSheet';

const demoExercise = generateExercise(1, 42, 4);

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Rhythm Practice App</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{demoExercise.title}</h2>
        <p className="text-gray-500 mb-4">{demoExercise.subtitle}</p>
        <ExerciseSheet exercise={demoExercise} />
      </div>
    </div>
  )
}

export default App
