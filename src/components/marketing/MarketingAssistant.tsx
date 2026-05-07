'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Sparkles, 
  Target, 
  Users, 
  MessageSquare, 
  Image as ImageIcon, 
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  Copy,
  Download,
  ChevronRight,
  Zap,
  TrendingUp,
  Heart,
  Star,
  Clock,
  Trophy,
  CheckCircle,
  Loader2,
  Save,
  RefreshCw,
  FileText,
  Mail,
  Video,
  Megaphone,
  BookOpen,
  FormatAlignLeft,
  Building2,
  Wrench,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Types
interface Product {
  id: string;
  name: string;
  industry: string;
  problemSolved: string;
  features: string[];
  targetAudience: string;
  pricingModel: string;
  competitors: string;
  differentiators: string;
  websiteUrl: string;
  createdAt: string;
}

interface ProductAnalysis {
  valueProposition: string;
  painPointsSolved: string[];
  competitiveAdvantages: string[];
  marketPositioning: string;
  emotionalHooks: string[];
  uniqueSellingPoints: string[];
}

interface BuyerPersona {
  id: string;
  name: string;
  role: string;
  demographics: {
    ageRange: string;
    companySize: string;
    location: string;
    experience: string;
  };
  psychographics: {
    motivations: string[];
    fears: string[];
    values: string[];
  };
  painPoints: string[];
  goals: string[];
  channels: string[];
  triggers: string[];
  objections: string[];
}

interface SalesAngle {
  id: string;
  type: string;
  title: string;
  headline: string;
  subheadline: string;
  keyPoints: string[];
  callToAction: string;
  bestFor: string;
}

interface ContentItem {
  id: string;
  type: string;
  platform: string;
  title: string;
  content: string;
  hashtags?: string[];
}

interface GeneratedImage {
  id: string;
  prompt: string;
  base64: string;
  filepath: string;
  createdAt: string;
}

interface CalendarEvent {
  id: string;
  productId: string;
  title: string;
  description: string;
  date: string;
  platform: string;
  status: string;
}

type ViewType = 'dashboard' | 'product' | 'analysis' | 'personas' | 'angles' | 'content' | 'images' | 'calendar';

export default function MarketingAssistant() {
  // State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [personas, setPersonas] = useState<BuyerPersona[]>([]);
  const [salesAngles, setSalesAngles] = useState<SalesAngle[]>([]);
  const [generatedContent, setGeneratedContent] = useState<ContentItem[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  
  const [loading, setLoading] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  
  // Form state for new product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    industry: '',
    problemSolved: '',
    features: [],
    targetAudience: '',
    pricingModel: '',
    competitors: '',
    differentiators: '',
    websiteUrl: ''
  });

  // Content generation state
  const [contentType, setContentType] = useState('social-post');
  const [platform, setPlatform] = useState('linkedin');
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageSize, setImageSize] = useState('1024x1024');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load saved data on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem('marketing-products');
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      setProducts(parsed);
      if (parsed.length > 0) {
        setCurrentProduct(parsed[0]);
        setProductForm(parsed[0]);
      }
    }
    
    const savedImages = localStorage.getItem('marketing-images');
    if (savedImages) {
      setGeneratedImages(JSON.parse(savedImages));
    }
    
    const savedEvents = localStorage.getItem('marketing-calendar');
    if (savedEvents) {
      setCalendarEvents(JSON.parse(savedEvents));
    }
  }, []);

  // Save products when changed
  useEffect(() => {
    localStorage.setItem('marketing-products', JSON.stringify(products));
  }, [products]);

  // Save images when changed
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem('marketing-images', JSON.stringify(generatedImages));
    }
  }, [generatedImages]);

  // Save calendar events when changed
  useEffect(() => {
    if (calendarEvents.length > 0) {
      localStorage.setItem('marketing-calendar', JSON.stringify(calendarEvents));
    }
  }, [calendarEvents]);

  // Product CRUD
  const saveProduct = () => {
    if (!productForm.name) {
      alert('El nombre del producto es obligatorio');
      return;
    }
    
    const product: Product = {
      id: currentProduct?.id || `prod-${Date.now()}`,
      name: productForm.name || '',
      industry: productForm.industry || '',
      problemSolved: productForm.problemSolved || '',
      features: productForm.features || [],
      targetAudience: productForm.targetAudience || '',
      pricingModel: productForm.pricingModel || '',
      competitors: productForm.competitors || '',
      differentiators: productForm.differentiators || '',
      websiteUrl: productForm.websiteUrl || '',
      createdAt: currentProduct?.createdAt || new Date().toISOString()
    };

    let updatedProducts: Product[];
    if (currentProduct) {
      updatedProducts = products.map(p => p.id === product.id ? product : p);
    } else {
      updatedProducts = [...products, product];
    }
    
    // Actualizar estado
    setProducts(updatedProducts);
    setCurrentProduct(product);
    
    // Guardar directamente en localStorage (aseguramos que se guarde)
    localStorage.setItem('marketing-products', JSON.stringify(updatedProducts));
    
    // Mostrar feedback
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);

    // Llamar a la API de análisis con el producto recién guardado
    analyzeProduct(product);
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setProductForm({
        ...productForm,
        features: [...(productForm.features || []), newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setProductForm({
      ...productForm,
      features: productForm.features?.filter((_, i) => i !== index)
    });
  };

  // API calls
  const analyzeProduct = async (productOverride?: Product) => {
    const productToAnalyze = productOverride ?? currentProduct;
    if (!productToAnalyze && !productForm.name) return;

    setLoading('analysis');
    try {
      const response = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productToAnalyze || productForm })
      });

      const data = await response.json();
      if (data.success) {
        setAnalysis(data.analysis);
        setCurrentView('analysis');
      }
    } catch (error) {
      console.error('Error analyzing product:', error);
    } finally {
      setLoading(null);
    }
  };

  const generatePersonas = async () => {
    if (!currentProduct) return;
    
    setLoading('personas');
    try {
      const response = await fetch('/api/generate-personas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: currentProduct })
      });
      
      const data = await response.json();
      if (data.success) {
        setPersonas(data.personas);
        setCurrentView('personas');
      }
    } catch (error) {
      console.error('Error generating personas:', error);
    } finally {
      setLoading(null);
    }
  };

  const generateAngles = async () => {
    if (!currentProduct) return;
    
    setLoading('angles');
    try {
      const response = await fetch('/api/generate-angles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: currentProduct, analysis })
      });
      
      const data = await response.json();
      if (data.success) {
        setSalesAngles(data.angles);
        setCurrentView('angles');
      }
    } catch (error) {
      console.error('Error generating angles:', error);
    } finally {
      setLoading(null);
    }
  };

  const generateContent = async () => {
    if (!currentProduct) return;
    
    setLoading('content');
    try {
      const response = await fetch('/api/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          product: currentProduct, 
          analysis, 
          contentType, 
          platform,
          persona: personas[0],
          angle: salesAngles[0]
        })
      });
      
      const data = await response.json();
      if (data.success) {
        // Transform the response into content items
        let items: ContentItem[] = [];
        if (data.content.posts) {
          items = data.content.posts.map((p: any, i: number) => ({
            id: `content-${Date.now()}-${i}`,
            type: contentType,
            platform: platform,
            title: p.title || `Post ${i + 1}`,
            content: p.content,
            hashtags: p.hashtags
          }));
        } else if (data.content.emails) {
          items = data.content.emails.map((e: any, i: number) => ({
            id: `content-${Date.now()}-${i}`,
            type: 'email-sequence',
            platform: platform,
            title: e.subject || `Email ${i + 1}`,
            content: `${e.previewText}\n\n${e.body}`
          }));
        } else if (data.content.ads) {
          items = data.content.ads.map((a: any, i: number) => ({
            id: `content-${Date.now()}-${i}`,
            type: 'ad-copy',
            platform: platform,
            title: a.headline || `Ad ${i + 1}`,
            content: `${a.primaryText}\n\n${a.description || ''}`
          }));
        } else if (data.content.hero) {
          items = [{
            id: `content-${Date.now()}`,
            type: 'landing-copy',
            platform: 'landing',
            title: 'Landing Page Copy',
            content: JSON.stringify(data.content, null, 2)
          }];
        } else if (data.content.scenes) {
          items = [{
            id: `content-${Date.now()}`,
            type: 'video-script',
            platform: platform,
            title: data.content.title || 'Video Script',
            content: JSON.stringify(data.content, null, 2)
          }];
        } else if (data.content.outline) {
          items = [{
            id: `content-${Date.now()}`,
            type: 'blog-outline',
            platform: 'blog',
            title: data.content.title || 'Blog Outline',
            content: JSON.stringify(data.content, null, 2)
          }];
        }
        
        setGeneratedContent(items);
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setLoading(null);
    }
  };

  const generateImage = async () => {
    if (!imagePrompt) return;
    
    setLoading('image');
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: imagePrompt,
          productId: currentProduct?.id,
          type: 'social',
          size: imageSize
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setGeneratedImages([data.image, ...generatedImages]);
        setImagePrompt('');
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(null);
    }
  };

  const addToCalendar = (content: ContentItem) => {
    if (!selectedDate) return;
    
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      productId: currentProduct?.id || '',
      title: content.title,
      description: content.content.substring(0, 100),
      date: selectedDate.toISOString(),
      platform: content.platform,
      status: 'scheduled'
    };
    
    setCalendarEvents([...calendarEvents, event]);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getAngleIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'problem-solution': <Target className="w-5 h-5" />,
      'roi': <TrendingUp className="w-5 h-5" />,
      'emotional': <Heart className="w-5 h-5" />,
      'social-proof': <Star className="w-5 h-5" />,
      'urgency': <Clock className="w-5 h-5" />,
      'competitive': <Trophy className="w-5 h-5" />
    };
    return icons[type] || <Target className="w-5 h-5" />;
  };

  const getContentTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'social-post': <MessageSquare className="w-4 h-4" />,
      'email-sequence': <Mail className="w-4 h-4" />,
      'landing-copy': <FileText className="w-4 h-4" />,
      'video-script': <Video className="w-4 h-4" />,
      'ad-copy': <Megaphone className="w-4 h-4" />,
      'blog-outline': <BookOpen className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'linkedin': 'bg-blue-600',
      'twitter': 'bg-sky-500',
      'instagram': 'bg-pink-600',
      'tiktok': 'bg-black',
      'facebook': 'bg-blue-700',
      'youtube': 'bg-red-600',
      'email': 'bg-gray-600',
      'landing': 'bg-purple-600',
      'google-ads': 'bg-yellow-500',
      'blog': 'bg-green-600'
    };
    return colors[platform] || 'bg-gray-600';
  };

  // Quick start example
  const loadExample = () => {
    const exampleProduct: Product = {
      id: `prod-${Date.now()}`,
      name: 'PropTech Maintenance',
      industry: 'Inmobiliario / PropTech',
      problemSolved: 'Las inmobiliarias pierden tiempo y dinero gestionando mantenimientos de forma ineficiente. Los inquilinos se frustran por la lentitud en resolver incidencias, lo que lleva a pérdidas de clientes y mayor rotación.',
      features: [
        'Portal de inquilinos para reportar incidencias',
        'Sistema de asignación automática de técnicos',
        'Tracking en tiempo real del estado de reparaciones',
        'Comunicación integrada inquilino-inmobiliaria-técnico',
        'Dashboard de métricas y KPIs',
        'Historial completo de mantenimientos por propiedad'
      ],
      targetAudience: 'Inmobiliarias medianas y grandes que gestionan múltiples propiedades en alquiler',
      pricingModel: 'SaaS mensual por número de propiedades gestionadas',
      competitors: 'Software genérico de gestión inmobiliaria, Excel/WhatsApp, soluciones enterprise caras',
      differentiators: 'Enfoque específico en mantenimiento, conecta todos los actores (inquilinos, inmobiliaria, técnicos), reduce tiempos de respuesta hasta un 70%',
      websiteUrl: '',
      createdAt: new Date().toISOString()
    };
    
    // Guardar el ejemplo
    const updatedProducts = [...products, exampleProduct];
    setProducts(updatedProducts);
    setCurrentProduct(exampleProduct);
    setProductForm(exampleProduct);
    
    // Guardar directamente en localStorage
    localStorage.setItem('marketing-products', JSON.stringify(updatedProducts));
    
    // Mostrar feedback y cambiar a análisis
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setCurrentView('analysis');
    }, 500);
  };

  // Render views
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Marketing & Sales Assistant</h1>
        <p className="text-white/80 text-lg">
          Transforma tu producto en ventas. Sin bloqueos. Sin estrés.
        </p>
        <div className="mt-6 flex gap-4">
          {products.length === 0 ? (
            <Button 
              size="lg" 
              className="bg-white text-purple-700 hover:bg-white/90"
              onClick={() => setCurrentView('product')}
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear mi primer producto
            </Button>
          ) : (
            <Button 
              size="lg" 
              className="bg-white text-purple-700 hover:bg-white/90"
              onClick={analyzeProduct}
              disabled={loading === 'analysis'}
            >
              {loading === 'analysis' ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              Analizar {currentProduct?.name}
            </Button>
          )}
          <Button 
            size="lg" 
            variant="outline" 
            className="border-white text-white hover:bg-white/20"
            onClick={loadExample}
          >
            Ver ejemplo (Inmobiliaria)
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{products.length}</p>
                <p className="text-sm text-muted-foreground">Productos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{personas.length}</p>
                <p className="text-sm text-muted-foreground">Buyer Personas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{generatedContent.length}</p>
                <p className="text-sm text-muted-foreground">Contenidos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <ImageIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{generatedImages.length}</p>
                <p className="text-sm text-muted-foreground">Imágenes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('product')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Nuevo Producto</h3>
                <p className="text-sm text-muted-foreground">Define tu producto</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => { if (currentProduct) { analyzeProduct(); }}}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Analizar</h3>
                <p className="text-sm text-muted-foreground">IA analiza tu producto</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('content')}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Generar Contenido</h3>
                <p className="text-sm text-muted-foreground">Posts, emails, videos...</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {products.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tus Productos</CardTitle>
            <CardDescription>Selecciona un producto para trabajar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {products.map(product => (
                <div 
                  key={product.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    currentProduct?.id === product.id 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                  onClick={() => {
                    setCurrentProduct(product);
                    setProductForm(product);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{product.name}</h4>
                      <p className="text-sm text-muted-foreground">{product.industry}</p>
                    </div>
                    <Badge variant="secondary">{product.features?.length || 0} features</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderProductForm = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Define tu Producto</h2>
          <p className="text-muted-foreground">Cuanto más detalle des, mejor será el análisis</p>
        </div>
        {products.length > 0 && (
          <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
            Volver al Dashboard
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Producto *</Label>
              <Input
                id="name"
                placeholder="Ej: PropTech Maintenance"
                value={productForm.name || ''}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Industria / Sector</Label>
              <Input
                id="industry"
                placeholder="Ej: Inmobiliario / PropTech"
                value={productForm.industry || ''}
                onChange={(e) => setProductForm({ ...productForm, industry: e.target.value })}
              />
            </div>
          </div>

          {/* Problem */}
          <div className="space-y-2">
            <Label htmlFor="problem">Problema que resuelve *</Label>
            <Textarea
              id="problem"
              placeholder="Describe el problema principal que tu producto soluciona. Sé específico sobre los dolores de tus clientes."
              className="min-h-[100px]"
              value={productForm.problemSolved || ''}
              onChange={(e) => setProductForm({ ...productForm, problemSolved: e.target.value })}
            />
          </div>

          {/* Features */}
          <div className="space-y-2">
            <Label>Características principales</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Añade una característica"
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              />
              <Button onClick={addFeature} type="button">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {(productForm.features || []).map((feature, index) => (
                <Badge key={index} variant="secondary" className="py-1.5 px-3">
                  {feature}
                  <button 
                    className="ml-2 hover:text-red-500"
                    onClick={() => removeFeature(index)}
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="audience">Audiencia objetivo</Label>
            <Textarea
              id="audience"
              placeholder="¿Quién es tu cliente ideal? Edad, cargo, tipo de empresa..."
              value={productForm.targetAudience || ''}
              onChange={(e) => setProductForm({ ...productForm, targetAudience: e.target.value })}
            />
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="pricing">Modelo de precios</Label>
              <Input
                id="pricing"
                placeholder="Ej: SaaS $99/mes por usuario"
                value={productForm.pricingModel || ''}
                onChange={(e) => setProductForm({ ...productForm, pricingModel: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={productForm.websiteUrl || ''}
                onChange={(e) => setProductForm({ ...productForm, websiteUrl: e.target.value })}
              />
            </div>
          </div>

          {/* Competitors */}
          <div className="space-y-2">
            <Label htmlFor="competitors">Competidores</Label>
            <Textarea
              id="competitors"
              placeholder="¿Quiénes son tus competidores? ¿Qué soluciones alternativas usan tus clientes potenciales?"
              value={productForm.competitors || ''}
              onChange={(e) => setProductForm({ ...productForm, competitors: e.target.value })}
            />
          </div>

          {/* Differentiators */}
          <div className="space-y-2">
            <Label htmlFor="differentiators">Diferenciadores clave</Label>
            <Textarea
              id="differentiators"
              placeholder="¿Qué te hace diferente? ¿Por qué deberían elegirte?"
              value={productForm.differentiators || ''}
              onChange={(e) => setProductForm({ ...productForm, differentiators: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
              Cancelar
            </Button>
            <Button 
              onClick={saveProduct}
              disabled={!productForm.name || !productForm.problemSolved}
              className={`${saveSuccess ? 'bg-green-600' : 'bg-gradient-to-r from-purple-600 to-pink-600'}`}
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  ¡Guardado!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar y Analizar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAnalysis = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Análisis del Producto</h2>
          <p className="text-muted-foreground">{currentProduct?.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={analyzeProduct} disabled={loading === 'analysis'}>
            {loading === 'analysis' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Re-analizar
          </Button>
          <Button onClick={generatePersonas} disabled={!analysis || loading === 'personas'}>
            {loading === 'personas' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Users className="w-4 h-4 mr-2" />
            )}
            Generar Personas
          </Button>
          <Button onClick={generateAngles} disabled={!analysis || loading === 'angles'}>
            {loading === 'angles' ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            Generar Ángulos
          </Button>
        </div>
      </div>

      {!analysis ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="p-4 bg-purple-100 rounded-full w-fit mx-auto">
              <Target className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold">Sin análisis</h3>
            <p className="text-muted-foreground">
              Haz clic en "Analizar" para que la IA analice tu producto
            </p>
            <Button onClick={analyzeProduct} disabled={loading === 'analysis'}>
              {loading === 'analysis' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Analizar Producto
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Value Proposition */}
          <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6" />
                <span className="font-semibold text-white/80">Propuesta de Valor</span>
              </div>
              <p className="text-2xl font-bold">{analysis.valueProposition}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pain Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-red-500" />
                  Problemas que Resuelve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.painPointsSolved.map((point, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Competitive Advantages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Ventajas Competitivas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.competitiveAdvantages.map((adv, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Star className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Emotional Hooks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Ganchos Emocionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.emotionalHooks.map((hook, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-pink-500 mt-0.5 shrink-0" />
                      <span>{hook}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Market Positioning */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Posicionamiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{analysis.marketPositioning}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );

  const renderPersonas = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Buyer Personas</h2>
          <p className="text-muted-foreground">Conoce a quién le vendes</p>
        </div>
        <Button onClick={generatePersonas} disabled={!currentProduct || loading === 'personas'}>
          {loading === 'personas' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Regenerar
        </Button>
      </div>

      {personas.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="p-4 bg-blue-100 rounded-full w-fit mx-auto">
              <Users className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold">Sin Buyer Personas</h3>
            <p className="text-muted-foreground">
              Genera buyer personas basados en tu producto
            </p>
            <Button onClick={generatePersonas} disabled={!currentProduct || loading === 'personas'}>
              {loading === 'personas' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Users className="w-4 h-4 mr-2" />
              )}
              Generar Personas
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {personas.map((persona) => (
            <Card key={persona.id} className="overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                    {persona.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{persona.name}</h3>
                    <p className="text-white/80">{persona.role}</p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6 space-y-6">
                {/* Demographics */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Demografía</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Edad:</strong> {persona.demographics.ageRange}</div>
                    <div><strong>Empresa:</strong> {persona.demographics.companySize}</div>
                    <div><strong>Ubicación:</strong> {persona.demographics.location}</div>
                    <div><strong>Experiencia:</strong> {persona.demographics.experience}</div>
                  </div>
                </div>

                {/* Pain Points */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Puntos de Dolor</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.painPoints.map((pain, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">{pain}</Badge>
                    ))}
                  </div>
                </div>

                {/* Goals */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Objetivos</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.goals.map((goal, i) => (
                      <Badge key={i} variant="default" className="text-xs">{goal}</Badge>
                    ))}
                  </div>
                </div>

                {/* Channels */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Canales</h4>
                  <div className="flex flex-wrap gap-2">
                    {persona.channels.map((channel, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{channel}</Badge>
                    ))}
                  </div>
                </div>

                {/* Objections */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground uppercase">Objeciones Comunes</h4>
                  <ul className="text-sm space-y-1">
                    {persona.objections.map((obj, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderAngles = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ángulos de Venta</h2>
          <p className="text-muted-foreground">Diferentes formas de posicionar tu producto</p>
        </div>
        <Button onClick={generateAngles} disabled={!currentProduct || loading === 'angles'}>
          {loading === 'angles' ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Regenerar
        </Button>
      </div>

      {salesAngles.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="space-y-4">
            <div className="p-4 bg-green-100 rounded-full w-fit mx-auto">
              <Target className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Sin Ángulos de Venta</h3>
            <p className="text-muted-foreground">
              Genera diferentes ángulos para vender tu producto
            </p>
            <Button onClick={generateAngles} disabled={!currentProduct || loading === 'angles'}>
              {loading === 'angles' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Target className="w-4 h-4 mr-2" />
              )}
              Generar Ángulos
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salesAngles.map((angle) => (
            <Card key={angle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    {getAngleIcon(angle.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{angle.title}</CardTitle>
                    <CardDescription className="text-xs">Mejor para: {angle.bestFor}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-bold text-lg">{angle.headline}</p>
                  <p className="text-sm text-muted-foreground">{angle.subheadline}</p>
                </div>
                <ul className="space-y-1">
                  {angle.keyPoints.map((point, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 mt-0.5 text-purple-500 shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
                <div className="pt-2 border-t">
                  <p className="text-sm font-semibold text-purple-600">CTA: {angle.callToAction}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generador de Contenido</h2>
          <p className="text-muted-foreground">Posts, emails, videos, landing pages...</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label>Tipo de Contenido</Label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-post">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Post de Redes Sociales
                    </div>
                  </SelectItem>
                  <SelectItem value="email-sequence">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Secuencia de Emails
                    </div>
                  </SelectItem>
                  <SelectItem value="landing-copy">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Copy para Landing
                    </div>
                  </SelectItem>
                  <SelectItem value="video-script">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4" />
                      Guión de Video
                    </div>
                  </SelectItem>
                  <SelectItem value="ad-copy">
                    <div className="flex items-center gap-2">
                      <Megaphone className="w-4 h-4" />
                      Copy de Anuncios
                    </div>
                  </SelectItem>
                  <SelectItem value="blog-outline">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Outline de Blog
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contentType === 'social-post' && (
                    <>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter / X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                    </>
                  )}
                  {contentType === 'email-sequence' && (
                    <>
                      <SelectItem value="cold">Cold Outreach</SelectItem>
                      <SelectItem value="nurture">Nurture</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                    </>
                  )}
                  {contentType === 'video-script' && (
                    <>
                      <SelectItem value="tiktok">TikTok / Reels</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="instagram">Instagram Reels</SelectItem>
                    </>
                  )}
                  {contentType === 'ad-copy' && (
                    <>
                      <SelectItem value="facebook">Facebook / Instagram</SelectItem>
                      <SelectItem value="google-ads">Google Ads</SelectItem>
                      <SelectItem value="linkedin">LinkedIn Ads</SelectItem>
                    </>
                  )}
                  {(contentType === 'landing-copy' || contentType === 'blog-outline') && (
                    <SelectItem value="general">General</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={generateContent} 
                disabled={!currentProduct || loading === 'content'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {loading === 'content' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Generar Contenido
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedContent.length > 0 && (
        <div className="space-y-4">
          {generatedContent.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg text-white ${getPlatformColor(item.platform)}`}>
                      {getContentTypeIcon(item.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{item.platform}</Badge>
                        <Badge variant="secondary">{item.type}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Programar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            if (date) {
                              addToCalendar(item);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(item.content)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm">
                  {item.content}
                </div>
                {item.hashtags && item.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.hashtags.map((tag, i) => (
                      <Badge key={i} variant="secondary">#{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderImages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Generador de Imágenes</h2>
          <p className="text-muted-foreground">Crea visuales para tu marketing</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label>Describe la imagen</Label>
              <Textarea
                placeholder="Ej: Un dashboard moderno de gestión inmobiliaria mostrando métricas de mantenimiento, con gráficos de reducción de tiempos, colores profesionales azul y púrpura, estilo SaaS"
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tamaño</Label>
              <Select value={imageSize} onValueChange={setImageSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">1024x1024 (Cuadrado)</SelectItem>
                  <SelectItem value="1344x768">1344x768 (Horizontal)</SelectItem>
                  <SelectItem value="768x1344">768x1344 (Vertical)</SelectItem>
                  <SelectItem value="1152x864">1152x864 (Horizontal)</SelectItem>
                  <SelectItem value="1440x720">1440x720 (Banner)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={generateImage} 
                disabled={!imagePrompt || loading === 'image'}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {loading === 'image' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <ImageIcon className="w-4 h-4 mr-2" />
                )}
                Generar Imagen
              </Button>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="mt-4">
            <Label className="text-xs text-muted-foreground">Prompts rápidos:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[
                `${currentProduct?.name || 'Producto'} logo moderno y minimalista`,
                'Dashboard SaaS profesional con métricas',
                'Post de Instagram sobre productividad',
                'Banner publicitario moderno tech',
                'Mockup de app móvil en dispositivo'
              ].map((prompt, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm"
                  onClick={() => setImagePrompt(prompt)}
                >
                  {prompt.substring(0, 30)}...
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {generatedImages.map((img) => (
            <Card key={img.id} className="overflow-hidden">
              <div className="aspect-square relative">
                <img 
                  src={`data:image/png;base64,${img.base64}`}
                  alt={img.prompt}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground truncate">{img.prompt}</p>
                <div className="flex gap-2 mt-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = `data:image/png;base64,${img.base64}`;
                      link.download = `generated-${img.id}.png`;
                      link.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderCalendar = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendario de Publicaciones</h2>
          <p className="text-muted-foreground">Organiza tu contenido programado</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contenido Programado</CardTitle>
            <CardDescription>
              {calendarEvents.length} eventos programados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {calendarEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Sin eventos programados</p>
                <p className="text-sm">Genera contenido y prográmalo desde el Generador de Contenido</p>
              </div>
            ) : (
              <div className="space-y-3">
                {calendarEvents.map((event) => (
                  <div 
                    key={event.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className={`w-3 h-3 rounded-full ${getPlatformColor(event.platform)}`} />
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.date), "d 'de' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                    <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
                      {event.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setCalendarEvents(calendarEvents.filter(e => e.id !== event.id))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white border-r shadow-sm p-4 hidden md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Marketing AI
          </h1>
          <p className="text-xs text-muted-foreground">Tu asistente de ventas</p>
        </div>

        <nav className="space-y-2">
          {[
            { id: 'dashboard', icon: Sparkles, label: 'Dashboard' },
            { id: 'product', icon: Plus, label: 'Producto' },
            { id: 'analysis', icon: Target, label: 'Análisis' },
            { id: 'personas', icon: Users, label: 'Personas' },
            { id: 'angles', icon: MessageSquare, label: 'Ángulos' },
            { id: 'content', icon: FileText, label: 'Contenido' },
            { id: 'images', icon: ImageIcon, label: 'Imágenes' },
            { id: 'calendar', icon: CalendarIcon, label: 'Calendario' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                currentView === item.id
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {currentProduct && (
          <div className="absolute bottom-4 left-4 right-4 p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Producto activo:</p>
            <p className="font-semibold text-sm truncate">{currentProduct.name}</p>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="md:ml-64 p-6">
        {/* Mobile Header */}
        <div className="md:hidden mb-6 flex overflow-x-auto gap-2 pb-2">
          {[
            { id: 'dashboard', icon: Sparkles },
            { id: 'product', icon: Plus },
            { id: 'analysis', icon: Target },
            { id: 'personas', icon: Users },
            { id: 'angles', icon: MessageSquare },
            { id: 'content', icon: FileText },
            { id: 'images', icon: ImageIcon },
            { id: 'calendar', icon: CalendarIcon }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as ViewType)}
              className={`p-3 rounded-lg shrink-0 ${
                currentView === item.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border'
              }`}
            >
              <item.icon className="w-5 h-5" />
            </button>
          ))}
        </div>

        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'product' && renderProductForm()}
        {currentView === 'analysis' && renderAnalysis()}
        {currentView === 'personas' && renderPersonas()}
        {currentView === 'angles' && renderAngles()}
        {currentView === 'content' && renderContent()}
        {currentView === 'images' && renderImages()}
        {currentView === 'calendar' && renderCalendar()}
      </div>
    </div>
  );
}
