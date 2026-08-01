import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'
import { useDashboard } from '../contexts/DashboardContext'
import {
  Camera,
  ScanLine,
  Search,
  Plus,
  X,
  AlertCircle,
  Loader2,
  Package,
  Keyboard,
  ChevronDown,
  Flame,
  Beef,
  Wheat,
  Cookie,
} from 'lucide-react'

const MEAL_TYPES = [
  { value: 'breakfast', label: 'Desayuno' },
  { value: 'lunch', label: 'Almuerzo' },
  { value: 'snack', label: 'Merienda' },
  { value: 'dinner', label: 'Cena' },
]

function NutritionScoreBadge({ score }) {
  if (score == null) return null
  let color, label
  if (score >= 8) {
    color = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    label = 'Excelente'
  } else if (score >= 6) {
    color = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    label = 'Bueno'
  } else if (score >= 4) {
    color = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
    label = 'Moderado'
  } else {
    color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    label = 'Pobre'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {score.toFixed(1)} - {label}
    </span>
  )
}

function FoodCard({ food, onAdd }) {
  const [adding, setAdding] = useState(false)
  const [mealType, setMealType] = useState('lunch')
  const [quantity, setQuantity] = useState(100)
  const [showMealSelect, setShowMealSelect] = useState(false)

  const handleAdd = async () => {
    setAdding(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const n = food.nutritionPer100g || {}
      const factor = quantity / 100
      await api.meals.log({
        date: today,
        mealType,
        foods: [{
          foodId: food._id || food.id || null,
          name: food.name,
          quantity,
          calories: Math.round((n.calories || 0) * factor * 10) / 10,
          protein: Math.round((n.protein || 0) * factor * 10) / 10,
          fat: Math.round((n.fat || 0) * factor * 10) / 10,
          carbs: Math.round((n.carbs || 0) * factor * 10) / 10,
        }],
      })
      onAdd()
    } catch (err) {
      console.error('Failed to add meal:', err)
    } finally {
      setAdding(false)
      setShowMealSelect(false)
    }
  }

  const n = food.nutritionPer100g || food
  const factor = quantity / 100

  return (
    <div className="card space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{food.name}</h4>
          {food.brand && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{food.brand}</p>
          )}
        </div>
        <NutritionScoreBadge score={food.nutritionalScore || food.nutritionScore} />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
          <Flame className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {Math.round((n.calories || 0) * factor)}
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">kcal</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
          <Beef className="w-4 h-4 text-red-500 mx-auto mb-0.5" />
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {Math.round((n.protein || 0) * factor)}g
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">protein</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
          <Wheat className="w-4 h-4 text-amber-500 mx-auto mb-0.5" />
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {Math.round((n.carbs || 0) * factor)}g
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">carbos</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2">
          <Cookie className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            {Math.round((n.fat || 0) * factor)}g
          </p>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">grasa</p>
        </div>
      </div>

      <div>
        <label className="label">Cantidad (g)</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
          className="input-field"
          min="1"
          max="2000"
          step="1"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMealSelect(!showMealSelect)}
          className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300"
        >
          <span>{MEAL_TYPES.find((m) => m.value === mealType)?.label}</span>
          <ChevronDown className="w-4 h-4" />
        </button>
        {showMealSelect && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden z-10">
            {MEAL_TYPES.map((mt) => (
              <button
                key={mt.value}
                onClick={() => {
                  setMealType(mt.value)
                  setShowMealSelect(false)
                }}
                className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                  mealType === mt.value
                    ? 'text-brand-500 font-semibold bg-brand-50 dark:bg-brand-900/20'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {mt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={handleAdd}
        disabled={adding}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {adding ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Plus className="w-5 h-5" />
            <span>Agregar a la comida</span>
          </>
        )}
      </button>
    </div>
  )
}

export default function Scanner() {
  const [mode, setMode] = useState(null)
  const [barcode, setBarcode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [foundFood, setFoundFood] = useState(null)
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cameraActive, setCameraActive] = useState(false)
  const [scanning, setScanning] = useState(false)
  const { refreshDashboard } = useDashboard()

  const [manualForm, setManualForm] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    saturatedFat: '',
    sugar: '',
    fiber: '',
    sodium: '',
    servingSize: '',
    barcode: '',
  })

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = async () => {
    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')
      await BarcodeScanner.stopScan()
    } catch (err) {
      // plugin no disponible (web)
    }
    setCameraActive(false)
    setScanning(false)
  }

  const startCamera = async () => {
    setError('')
    setScanning(true)
    try {
      const { BarcodeScanner } = await import('@capacitor-mlkit/barcode-scanning')

      const isAvailable = await BarcodeScanner.isSupported()
      if (!isAvailable.supported) {
        setError('El escaneo con cámara no está disponible en este dispositivo.')
        setScanning(false)
        return
      }

      const permission = await BarcodeScanner.requestPermissions()
      if (permission.camera !== 'granted') {
        setError('Permiso de cámara denegado. Puedes ingresar el código manualmente.')
        setScanning(false)
        return
      }

      // Escaneo con lente overlay transparente para ver la cámara debajo
      await BarcodeScanner.scan()

      // Escaneo continuo
      await BarcodeScanner.startScan()

      const listener = await BarcodeScanner.addListener('barcodeScanned', async (result) => {
        const raw = result.barcode?.rawValue || result.barcode || ''
        if (!raw) return
        const clean = raw.trim()
        if (clean.length < 4) return
        console.log('Código escaneado:', clean)
        await BarcodeScanner.stopScan()
        setCameraActive(false)
        setScanning(false)
        listener.remove()
        setBarcode(clean)
        handleBarcodeSearch(clean)
      })

      setCameraActive(true)
    } catch (err) {
      console.error('Scanner error:', err)
      setError('No se pudo acceder a la cámara. Puedes ingresar el código manualmente.')
      setScanning(false)
    }
  }

  const handleBarcodeSearch = async (code) => {
    const target = code || barcode
    if (!target.trim()) return
    setLoading(true)
    setError('')
    setFoundFood(null)
    try {
      const data = await api.foods.getByBarcode(target.trim())
      if (data.food) {
        setFoundFood(data.food)
      } else {
        setError('Producto no encontrado. Intenta escanear la tabla nutricional o ingresar los datos manualmente.')
      }
    } catch (err) {
      setError('Producto no encontrado en la base de datos.')
    } finally {
      setLoading(false)
    }
  }

  const handleTextSearch = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setError('')
    setSearchResults([])
    try {
      const data = await api.foods.search(searchQuery.trim())
      const results = data.foods || data || []
      if (results.length > 0) {
        setSearchResults(results)
      } else {
        setError('No se encontraron resultados. Prueba con otro termino o crea un alimento personalizado.')
      }
    } catch (err) {
      setError('Error al buscar alimentos.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSubmit = async (e) => {
    e.preventDefault()
    if (!manualForm.name.trim()) {
      setError('El nombre del alimento es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    try {
      const food = await api.foods.create({
        name: manualForm.name.trim(),
        barcode: manualForm.barcode.trim() || undefined,
        nutritionPer100g: {
          calories: parseFloat(manualForm.calories) || 0,
          protein: parseFloat(manualForm.protein) || 0,
          fat: parseFloat(manualForm.fat) || 0,
          saturatedFat: parseFloat(manualForm.saturatedFat) || 0,
          carbs: parseFloat(manualForm.carbs) || 0,
          sugar: parseFloat(manualForm.sugar) || 0,
          fiber: parseFloat(manualForm.fiber) || 0,
          sodium: parseFloat(manualForm.sodium) || 0,
        },
        servingSize: manualForm.servingSize ? parseInt(manualForm.servingSize) : 100,
        category: 'custom',
      })
      setFoundFood(food.food || food)
      setManualForm({
        name: '', calories: '', protein: '', carbs: '', fat: '',
        saturatedFat: '', sugar: '', fiber: '', sodium: '',
        servingSize: '', barcode: '',
      })
    } catch (err) {
      setError('Error al crear el alimento')
    } finally {
      setLoading(false)
    }
  }

  const handleAddFood = () => {
    refreshDashboard()
    setFoundFood(null)
    setSearchResults([])
    setBarcode('')
    setSearchQuery('')
    setMode(null)
  }

  const goBack = () => {
    stopScanner()
    setMode(null)
    setFoundFood(null)
    setSearchResults([])
    setError('')
  }

  return (
    <div className="page-container space-y-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Escaner</h2>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!mode && (
        <div className="space-y-3">
          <button
            onClick={() => setMode('barcode')}
            className="card w-full flex items-center gap-4 hover:shadow-md transition-shadow duration-200 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
              <ScanLine className="w-6 h-6 text-brand-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Codigo de barras</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Escanea o ingresa un codigo</p>
            </div>
          </button>

          <button
            onClick={() => setMode('manual')}
            className="card w-full flex items-center gap-4 hover:shadow-md transition-shadow duration-200 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-orange-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Entrada manual</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Ingresa datos nutricionales</p>
            </div>
          </button>

          <button
            onClick={() => setMode('search')}
            className="card w-full flex items-center gap-4 hover:shadow-md transition-shadow duration-200 active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Buscar alimento</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Busca en la base de datos</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'barcode' && (
        <div className="space-y-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
            Volver
          </button>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Codigo de barras</h3>

            <div className="space-y-3">
              {!cameraActive && (
                <button
                  onClick={startCamera}
                  disabled={scanning}
                  className="btn-secondary w-full flex items-center justify-center gap-2"
                >
                  {scanning ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                  <span>{scanning ? 'Abriendo camara...' : 'Escanear con camara'}</span>
                </button>
              )}

              {cameraActive && (
                <div className="relative rounded-xl overflow-hidden mb-4 bg-black">
                  <div className="w-full h-56 flex items-center justify-center">
                    <div className="text-center px-4">
                      <ScanLine className="w-10 h-10 text-brand-400 mx-auto mb-2" />
                      <p className="text-white text-sm">
                        Apunta la camara al codigo de barras
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-3/4 h-24 border-2 border-brand-400/80 rounded-xl">
                      <div className="w-full h-0.5 bg-brand-400/80 animate-pulse" />
                    </div>
                  </div>
                  <button
                    onClick={() => stopScanner()}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div>
                <label className="label">O ingresa el codigo manualmente</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Ej: 7501234567890"
                    onKeyDown={(e) => e.key === 'Enter' && handleBarcodeSearch()}
                  />
                  <button
                    onClick={() => handleBarcodeSearch()}
                    disabled={loading || !barcode.trim()}
                    className="btn-primary px-4"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {foundFood && (
            <FoodCard food={foundFood} onAdd={handleAddFood} />
          )}
        </div>
      )}

      {mode === 'search' && (
        <div className="space-y-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
            Volver
          </button>

          <div className="card">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field flex-1"
                placeholder="Buscar alimento..."
                onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
              />
              <button
                onClick={handleTextSearch}
                disabled={loading || !searchQuery.trim()}
                className="btn-primary px-4"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div className="space-y-3">
              {searchResults.map((food, index) => (
                <FoodCard key={food._id || food.id || index} food={food} onAdd={handleAddFood} />
              ))}
            </div>
          )}

          {foundFood && (
            <FoodCard food={foundFood} onAdd={handleAddFood} />
          )}
        </div>
      )}

      {mode === 'manual' && (
        <div className="space-y-4">
          <button
            onClick={goBack}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
            Volver
          </button>

          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Datos nutricionales
            </h3>
            <form onSubmit={handleManualSubmit} className="space-y-3">
              <div>
                <label className="label">Nombre del alimento *</label>
                <input
                  type="text"
                  value={manualForm.name}
                  onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                  className="input-field"
                  placeholder="Ej: Manzana"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Calorias (kcal/100g)</label>
                  <input
                    type="number"
                    value={manualForm.calories}
                    onChange={(e) => setManualForm({ ...manualForm, calories: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="label">Tamanio porcion (g)</label>
                  <input
                    type="number"
                    value={manualForm.servingSize}
                    onChange={(e) => setManualForm({ ...manualForm, servingSize: e.target.value })}
                    className="input-field"
                    placeholder="100"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Proteina (g)</label>
                  <input
                    type="number"
                    value={manualForm.protein}
                    onChange={(e) => setManualForm({ ...manualForm, protein: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Carbos (g)</label>
                  <input
                    type="number"
                    value={manualForm.carbs}
                    onChange={(e) => setManualForm({ ...manualForm, carbs: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Grasa (g)</label>
                  <input
                    type="number"
                    value={manualForm.fat}
                    onChange={(e) => setManualForm({ ...manualForm, fat: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="label">Grasa sat. (g)</label>
                  <input
                    type="number"
                    value={manualForm.saturatedFat}
                    onChange={(e) => setManualForm({ ...manualForm, saturatedFat: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Azucar (g)</label>
                  <input
                    type="number"
                    value={manualForm.sugar}
                    onChange={(e) => setManualForm({ ...manualForm, sugar: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="label">Fibra (g)</label>
                  <input
                    type="number"
                    value={manualForm.fiber}
                    onChange={(e) => setManualForm({ ...manualForm, fiber: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Sodio (mg)</label>
                  <input
                    type="number"
                    value={manualForm.sodium}
                    onChange={(e) => setManualForm({ ...manualForm, sodium: e.target.value })}
                    className="input-field"
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                </div>
                <div>
                  <label className="label">Codigo de barras (opc.)</label>
                  <input
                    type="text"
                    value={manualForm.barcode}
                    onChange={(e) => setManualForm({ ...manualForm, barcode: e.target.value })}
                    className="input-field"
                    placeholder="7501234567890"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Package className="w-5 h-5" />
                    <span>Crear alimento</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {foundFood && (
            <FoodCard food={foundFood} onAdd={handleAddFood} />
          )}
        </div>
      )}
    </div>
  )
}
