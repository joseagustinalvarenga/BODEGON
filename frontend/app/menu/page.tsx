'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface MenuItem {
  name: string;
  description: string;
  price?: string;
  tag?: string;
  category: 'entradas' | 'principales' | 'guarniciones' | 'postres' | 'bebidas';
  emoji: string;
}

const MENU_ITEMS: MenuItem[] = [
  // Entradas
  {
    name: 'Empanadas Caseras',
    description: 'De Carne cortada a cuchillo, Pollo jugoso, o Jamón y Queso derretido.',
    price: '$1.800 c/u',
    tag: 'Clásico',
    category: 'entradas',
    emoji: '🥟'
  },
  {
    name: 'Rabas a la Romana',
    description: 'Tiernos aros de calamar rebozados, fritos a la perfección y servidos con limón fresco y alioli de la casa.',
    price: '$9.500',
    tag: 'Especialidad',
    category: 'entradas',
    emoji: '🦑'
  },
  {
    name: 'Bastoncitos de Muzarella',
    description: 'Muzarella premium empanada con hierbas finas, frita al punto justo, servida con salsa pomodoro caliente.',
    price: '$5.800',
    tag: 'Para Compartir',
    category: 'entradas',
    emoji: '🧀'
  },
  {
    name: 'Provoleta Especial',
    description: 'Queso provolone fundido a la parrilla con orégano, tomates confitados, jamón crudo y un chorrito de aceite de oliva extra virgen.',
    price: '$7.200',
    tag: 'A la Parrilla',
    category: 'entradas',
    emoji: '🍳'
  },

  // Platos Principales
  {
    name: 'Milanesas XL Napolitana',
    description: 'Nuestra clásica milanesa XL de ternera tiernizada con salsa de tomate de la casa, jamón cocido y abundante muzarella gratinada.',
    price: '$14.500',
    tag: 'El Favorito',
    category: 'principales',
    emoji: '🥩'
  },
  {
    name: 'Milanesas XL Fugazzeta',
    description: 'Milanesa gigante con cebollas caramelizadas, abundante queso muzarella derretido y un toque aromático de orégano fresco.',
    price: '$14.200',
    tag: 'Abundante',
    category: 'principales',
    emoji: '🧅'
  },
  {
    name: 'Milanesas XL Suiza',
    description: 'Milanesa XL bañada en salsa bechamel sedosa, queso gruyere fundido y perejil picado a mano.',
    price: '$14.900',
    tag: 'Premium',
    category: 'principales',
    emoji: '🧀'
  },
  {
    name: 'Sorrentinos de Jamón y Queso',
    description: 'Pastas rellenas hechas a mano, acompañadas con tu salsa favorita (Boloñesa clásica, Fileto dulce o Crema sedosa).',
    price: '$11.800',
    tag: 'Artesanal',
    category: 'principales',
    emoji: '🍝'
  },
  {
    name: 'Ravioles de Espinaca y Ricota',
    description: 'Pasta fresca con masa fina de espinaca rellena con ricota cremosa, parmesano y nuez moscada.',
    price: '$10.900',
    tag: 'Recomendado',
    category: 'principales',
    emoji: '🥟'
  },
  {
    name: 'Tallarines al Huevo Caseros',
    description: 'Tallarines anchos amasados diariamente en nuestra cocina, servidos con salsa a tu elección.',
    price: '$9.800',
    tag: 'Casero',
    category: 'principales',
    emoji: '🍜'
  },
  {
    name: 'Asado de Tira Premium',
    description: 'Corte clásico argentino a la leña de quebracho, dorado por fuera y jugoso por dentro.',
    price: '$18.500',
    tag: 'De la Parrilla',
    category: 'principales',
    emoji: '🍖'
  },
  {
    name: 'Vacío del Chef',
    description: 'Corte de cocción lenta y tierna textura, asado pacientemente a las brasas para potenciar todo su sabor.',
    price: '$19.200',
    tag: 'El Más Pedido',
    category: 'principales',
    emoji: '🥩'
  },
  {
    name: 'Choripán Bodegón',
    description: 'Chorizo premium bombón a la parrilla en pan francés crocante, servido con salsa chimichurri artesanal y criolla fresca.',
    price: '$4.500',
    tag: 'Al Paso',
    category: 'principales',
    emoji: '🌭'
  },

  // Guarniciones
  {
    name: 'Papas Fritas Tradicionales',
    description: 'Bastones de papa seleccionados, súper crocantes por fuera y tiernos por dentro.',
    price: '$3.500',
    tag: 'Básico',
    category: 'guarniciones',
    emoji: '🍟'
  },
  {
    name: 'Papas Fritas a la Provenzal',
    description: 'Nuestras papas fritas bañadas con una deliciosa mezcla de ajo picado fino, perejil fresco y aceite de oliva.',
    price: '$3.900',
    tag: 'El Clásico',
    category: 'guarniciones',
    emoji: '🧄'
  },
  {
    name: 'Papas Fritas a Caballo',
    description: 'Gran porción de papas fritas coronadas con dos huevos fritos jugosos de campo.',
    price: '$4.400',
    tag: 'Ideal Compartir',
    category: 'guarniciones',
    emoji: '🍳'
  },
  {
    name: 'Puré de Papa Rústico',
    description: 'Puré suave y cremoso elaborado con manteca premium, leche entera y un toque sutil de nuez moscada.',
    price: '$3.200',
    tag: 'Calidez',
    category: 'guarniciones',
    emoji: '🥔'
  },
  {
    name: 'Puré de Calabaza Asada',
    description: 'Calabazas caramelizadas al horno y procesadas con un toque de miel silvestre.',
    price: '$3.400',
    tag: 'Dulce toque',
    category: 'guarniciones',
    emoji: '🎃'
  },
  {
    name: 'Ensalada Mixta Fresca',
    description: 'Lechuga crujiente, tomates jugosos y cebolla cortada en pluma, aderezados a gusto.',
    price: '$2.900',
    tag: 'Fresco',
    category: 'guarniciones',
    emoji: '🥗'
  },

  // Postres
  {
    name: 'Flan Casero Especial',
    description: 'Receta tradicional de la abuela, con huevos de campo y servido con abundante dulce de leche y crema batida (Mixto).',
    price: '$3.800',
    tag: 'Imperdible',
    category: 'postres',
    emoji: '🍮'
  },
  {
    name: 'Budín de Pan de la Casa',
    description: 'Exquisito budín horneado lentamente al baño María con pasas y caramelo líquido, acompañado de dulce de leche.',
    price: '$3.600',
    tag: 'El de Siempre',
    category: 'postres',
    emoji: '🍞'
  },
  {
    name: 'Copa Helada Bodegón',
    description: 'Tres bochas de helado artesanal a elección con salsa de chocolate caliente, nueces picadas y obleas crujientes.',
    price: '$4.200',
    tag: 'Fresco',
    category: 'postres',
    emoji: '🍨'
  },

  // Bebidas
  {
    name: 'Aguas Minerales',
    description: 'Con o sin gas, embotellada de origen (500ml).',
    price: '$1.800',
    tag: 'Natural',
    category: 'bebidas',
    emoji: '💧'
  },
  {
    name: 'Gaseosas de Línea',
    description: 'Línea Coca-Cola, Sprite o Fanta (350ml en botella de vidrio).',
    price: '$2.000',
    tag: 'Fría',
    category: 'bebidas',
    emoji: '🥤'
  },
  {
    name: 'Vinos Seleccionados Malbec',
    description: 'Copa o botella de nuestra selecta cava de bodegas mendocinas para maridar tu carne.',
    price: '$8.500 bot.',
    tag: 'Para Maridar',
    category: 'bebidas',
    emoji: '🍷'
  },
  {
    name: 'Cervezas Nacionales',
    description: 'Cerveza tirada o botella (Quilmes, Patagonia o Stella Artois - 1L).',
    price: '$3.900',
    tag: 'Refrescante',
    category: 'bebidas',
    emoji: '🍺'
  }
];

const CATEGORIES = [
  { id: 'todos', label: 'Todo el Menú', emoji: '🍽️' },
  { id: 'entradas', label: 'Entradas', emoji: '🥟' },
  { id: 'principales', label: 'Platos Principales', emoji: '🥩' },
  { id: 'guarniciones', label: 'Guarniciones', emoji: '🍟' },
  { id: 'postres', label: 'Postres', emoji: '🍮' },
  { id: 'bebidas', label: 'Bebidas', emoji: '🍷' }
] as const;

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredItems = useMemo(() => {
    return MENU_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'todos' || item.category === selectedCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div style={{
      background: 'var(--bg-dark)',
      minHeight: '100vh',
      color: 'var(--text-primary)',
      fontFamily: "'Inter', sans-serif",
      padding: '40px 24px',
      position: 'relative',
      overflowX: 'hidden'
    }}>
      {/* Estilos e Inserciones de Fuentes */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
      `}</style>

      {/* Decorative Blur Backgrounds */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '-10%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(122,170,138,0.05) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '-10%',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.03) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header con botón para volver */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 }}>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--text-secondary)',
            fontSize: 14,
            fontWeight: 600,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <span style={{ fontSize: 16 }}>←</span> Volver al Club
          </Link>
          
          <div style={{
            padding: '6px 14px',
            background: 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.2)',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: '#c9a84c',
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            Gastronomía Criolla
          </div>
        </div>

        {/* Título Principal */}
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 900,
            color: '#fff',
            marginBottom: 16,
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}>
            La Carta de <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>El Bodegón</span>
          </h1>
          <p style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Una cuidadosa selección de recetas clásicas, milanesas gigantescas, parrilla humeante y postres caseros hechos para honrar el buen comer.
          </p>
          <div style={{
            width: 80,
            height: 3,
            background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
            margin: '24px auto 0'
          }} />
        </div>

        {/* Buscador y Filtros */}
        <div style={{
          background: 'rgba(22,18,16,0.7)',
          border: '1px solid var(--border-card)',
          borderRadius: 16,
          padding: '24px',
          backdropFilter: 'blur(10px)',
          marginBottom: 48,
          boxShadow: 'var(--shadow-card)'
        }}>
          {/* Campo de Búsqueda */}
          <div style={{ position: 'relative', marginBottom: 24 }}>
            <span style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: 18
            }}>🔍</span>
            <input
              type="text"
              placeholder="¿Qué tenés ganas de probar hoy? (ej. Provoleta, Sorrentinos...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(13,11,9,0.9)',
                border: '1px solid rgba(122,170,138,0.2)',
                borderRadius: 12,
                padding: '16px 16px 16px 48px',
                color: '#fff',
                fontSize: 15,
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(122,170,138,0.2)'}
            />
          </div>

          {/* Categorías (Pestañas) */}
          <div style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none'
          }} className="category-scroll">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 18px',
                    background: isActive ? 'var(--green-primary)' : 'rgba(255,255,255,0.03)',
                    border: isActive ? '1px solid var(--green-primary)' : '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 30,
                    color: isActive ? '#0d0b09' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--green-primary)';
                      e.currentTarget.style.color = '#fff';
                      e.currentTarget.style.background = 'rgba(122,170,138,0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }
                  }}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Listado de Platos */}
        {filteredItems.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: 24,
            marginBottom: 64
          }}>
            {filteredItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  background: 'linear-gradient(135deg, rgba(22,18,16,0.85) 0%, rgba(13,11,9,0.95) 100%)',
                  border: '1px solid rgba(201,168,76,0.1)',
                  borderRadius: 14,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 180,
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s, box-shadow 0.4s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.3)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(201,168,76,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'rgba(201,168,76,0.1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Decorative glow shape in the corner */}
                <div style={{
                  position: 'absolute',
                  top: -20,
                  right: -20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(122,170,138,0.04) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />

                <div>
                  {/* Top line with emoji and tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{
                      fontSize: 24,
                      background: 'rgba(255,255,255,0.03)',
                      width: 48,
                      height: 48,
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>{item.emoji}</span>
                    
                    {item.tag && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        color: 'var(--green-primary)',
                        padding: '4px 10px',
                        background: 'rgba(122,170,138,0.08)',
                        border: '1px solid rgba(122,170,138,0.15)',
                        borderRadius: 20
                      }}>{item.tag}</span>
                    )}
                  </div>

                  {/* Title and description */}
                  <h3 style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#fff',
                    marginBottom: 8,
                    fontFamily: "'Playfair Display', serif"
                  }}>{item.name}</h3>
                  
                  <p style={{
                    fontSize: 13,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    marginBottom: 20
                  }}>{item.description}</p>
                </div>

                {/* Pricing / Bottom Line */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                  paddingTop: 16
                }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Precio Online
                  </span>
                  <span style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: '#c9a84c',
                    fontFamily: 'monospace'
                  }}>{item.price || 'S/C'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '80px 24px',
            background: 'rgba(22,18,16,0.5)',
            border: '1px solid var(--border-card)',
            borderRadius: 16,
            marginBottom: 64
          }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🍽️</span>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>No encontramos lo que buscás</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Intentá con otros términos o seleccioná otra categoría.</p>
          </div>
        )}

        {/* Footer del Menú */}
        <div style={{
          textAlign: 'center',
          padding: '40px 24px',
          borderTop: '1px solid var(--border-card)',
          color: 'var(--text-muted)',
          fontSize: 12
        }}>
          <p>© {new Date().getFullYear()} El Bodegón Club de Fidelidad. Precios sujetos a modificación.</p>
        </div>
      </div>
    </div>
  );
}
