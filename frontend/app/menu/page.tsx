'use client';
import Link from 'next/link';
import { useState, useMemo } from 'react';

interface MenuItem {
  name: string;
  description: string;
  tag?: string;
  category: 'entradas' | 'principales' | 'guarniciones' | 'postres' | 'bebidas';
}

const MENU_ITEMS: MenuItem[] = [
  // Entradas
  {
    name: 'Empanadas Caseras',
    description: 'De Carne cortada a cuchillo, Pollo jugoso, o Jamón y Queso derretido.',
    tag: 'Clásico',
    category: 'entradas'
  },
  {
    name: 'Rabas a la Romana',
    description: 'Tiernos aros de calamar rebozados, fritos a la perfección y servidos con limón fresco y alioli de la casa.',
    tag: 'Especialidad',
    category: 'entradas'
  },
  {
    name: 'Bastoncitos de Muzarella',
    description: 'Muzarella premium empanada con hierbas finas, frita al punto justo, servida con salsa pomodoro caliente.',
    tag: 'Para Compartir',
    category: 'entradas'
  },
  {
    name: 'Provoleta Especial',
    description: 'Queso provolone fundido a la parrilla con orégano, tomates confitados, jamón crudo y un chorrito de aceite de oliva extra virgen.',
    tag: 'A la Parrilla',
    category: 'entradas'
  },

  // Platos Principales
  {
    name: 'Milanesas XL Napolitana',
    description: 'Nuestra clásica milanesa XL de ternera tiernizada con salsa de tomate de la casa, jamón cocido y abundante muzarella gratinada.',
    tag: 'El Favorito',
    category: 'principales'
  },
  {
    name: 'Milanesas XL Fugazzeta',
    description: 'Milanesa gigante con cebollas caramelizadas, abundante queso muzarella derretido y un toque aromático de orégano fresco.',
    tag: 'Abundante',
    category: 'principales'
  },
  {
    name: 'Milanesas XL Suiza',
    description: 'Milanesa XL bañada en salsa bechamel sedosa, queso gruyere fundido y perejil picado a mano.',
    tag: 'Premium',
    category: 'principales'
  },
  {
    name: 'Sorrentinos de Jamón y Queso',
    description: 'Pastas rellenas hechas a mano, acompañadas con tu salsa favorita (Boloñesa clásica, Fileto dulce o Crema sedosa).',
    tag: 'Artesanal',
    category: 'principales'
  },
  {
    name: 'Ravioles de Espinaca y Ricota',
    description: 'Pasta fresca con masa fina de espinaca rellena con ricota cremosa, parmesano y nuez moscada.',
    tag: 'Recomendado',
    category: 'principales'
  },
  {
    name: 'Tallarines al Huevo Caseros',
    description: 'Tallarines anchos amasados diariamente en nuestra cocina, servidos con salsa a tu elección.',
    tag: 'Casero',
    category: 'principales'
  },
  {
    name: 'Asado de Tira Premium',
    description: 'Corte clásico argentino a la leña de quebracho, dorado por fuera y jugoso por dentro.',
    tag: 'De la Parrilla',
    category: 'principales'
  },
  {
    name: 'Vacío del Chef',
    description: 'Corte de cocción lenta y tierna textura, asado pacientemente a las brasas para potenciar todo su sabor.',
    tag: 'El Más Pedido',
    category: 'principales'
  },
  {
    name: 'Choripán Bodegón',
    description: 'Chorizo premium bombón a la parrilla en pan francés crocante, servido con salsa chimichurri artesanal y criolla fresca.',
    tag: 'Al Paso',
    category: 'principales'
  },

  // Guarniciones
  {
    name: 'Papas Fritas Tradicionales',
    description: 'Bastones de papa seleccionados, súper crocantes por fuera y tiernos por dentro.',
    tag: 'Básico',
    category: 'guarniciones'
  },
  {
    name: 'Papas Fritas a la Provenzal',
    description: 'Nuestras papas fritas bañadas con una deliciosa mezcla de ajo picado fino, perejil fresco y aceite de oliva.',
    tag: 'El Clásico',
    category: 'guarniciones'
  },
  {
    name: 'Papas Fritas a Caballo',
    description: 'Gran porción de papas fritas coronadas con dos huevos fritos jugosos de campo.',
    tag: 'Ideal Compartir',
    category: 'guarniciones'
  },
  {
    name: 'Puré de Papa Rústico',
    description: 'Puré suave y cremoso elaborado con manteca premium, leche entera y un toque sutil de nuez moscada.',
    tag: 'Calidez',
    category: 'guarniciones'
  },
  {
    name: 'Puré de Calabaza Asada',
    description: 'Calabazas caramelizadas al horno y procesadas con un toque de miel silvestre.',
    tag: 'Dulce toque',
    category: 'guarniciones'
  },
  {
    name: 'Ensalada Mixta Fresca',
    description: 'Lechuga crujiente, tomates jugosos y cebolla cortada en pluma, aderezados a gusto.',
    tag: 'Fresco',
    category: 'guarniciones'
  },

  // Postres
  {
    name: 'Flan Casero Especial',
    description: 'Receta tradicional de la abuela, con huevos de campo y servido con abundante dulce de leche y crema batida (Mixto).',
    tag: 'Imperdible',
    category: 'postres'
  },
  {
    name: 'Budín de Pan de la Casa',
    description: 'Exquisito budín horneado lentamente al baño María con pasas y caramelo líquido, acompañado de dulce de leche.',
    tag: 'El de Siempre',
    category: 'postres'
  },
  {
    name: 'Copa Helada Bodegón',
    description: 'Tres bochas de helado artesanal a elección con salsa de chocolate caliente, nueces picadas y obleas crujientes.',
    tag: 'Fresco',
    category: 'postres'
  },

  // Bebidas
  {
    name: 'Aguas Minerales',
    description: 'Con o sin gas, embotellada de origen (500ml).',
    tag: 'Natural',
    category: 'bebidas'
  },
  {
    name: 'Gaseosas de Línea',
    description: 'Línea Coca-Cola, Sprite o Fanta (350ml en botella de vidrio).',
    tag: 'Fría',
    category: 'bebidas'
  },
  {
    name: 'Vinos Seleccionados Malbec',
    description: 'Copa o botella de nuestra selecta cava de bodegas mendocinas para maridar tu carne.',
    tag: 'Para Maridar',
    category: 'bebidas'
  },
  {
    name: 'Cervezas Nacionales',
    description: 'Cerveza tirada o botella (Quilmes, Patagonia o Stella Artois - 1L).',
    tag: 'Refrescante',
    category: 'bebidas'
  }
];

const CATEGORIES = [
  { id: 'todos', label: 'Todo el Menú' },
  { id: 'entradas', label: 'Entradas' },
  { id: 'principales', label: 'Platos Principales' },
  { id: 'guarniciones', label: 'Guarniciones' },
  { id: 'postres', label: 'Postres' },
  { id: 'bebidas', label: 'Bebidas' }
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
      padding: '60px 24px',
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
        background: 'radial-gradient(circle, rgba(122,170,138,0.04) 0%, transparent 70%)',
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
        background: 'radial-gradient(circle, rgba(201,168,76,0.02) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div style={{ maxWidth: 840, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header con botón para volver */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 54 }}>
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
            <span>←</span> Volver al Club
          </Link>
          
          <div style={{
            padding: '6px 14px',
            background: 'rgba(201,168,76,0.06)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            color: '#c9a84c',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Gastronomía Criolla
          </div>
        </div>

        {/* Título Principal */}
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 5vw, 56px)',
            fontWeight: 800,
            color: '#fff',
            marginBottom: 16,
            letterSpacing: '-0.01em',
            lineHeight: 1.1
          }}>
            La Carta de <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>El Bodegón</span>
          </h1>
          <p style={{
            fontSize: 15,
            color: 'var(--text-secondary)',
            maxWidth: 600,
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Una cuidosa selección de recetas clásicas, milanesas gigantescas, parrilla humeante y postres caseros hechos para honrar el buen comer.
          </p>
          <div style={{
            width: 60,
            height: 2,
            background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)',
            margin: '24px auto 0'
          }} />
        </div>

        {/* Buscador y Filtros */}
        <div style={{
          background: 'rgba(22,18,16,0.4)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16,
          padding: '20px',
          backdropFilter: 'blur(10px)',
          marginBottom: 48,
        }}>
          {/* Campo de Búsqueda */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <span style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              fontSize: 16
            }}>🔍</span>
            <input
              type="text"
              placeholder="Buscar un plato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(13,11,9,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 10,
                padding: '12px 16px 12px 44px',
                color: '#fff',
                fontSize: 14,
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--green-primary)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>

          {/* Categorías (Pestañas - Sin Emojis) */}
          <div style={{
            display: 'flex',
            gap: 8,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollbarWidth: 'none'
          }} className="category-scroll">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '8px 16px',
                    background: isActive ? 'var(--green-primary)' : 'transparent',
                    border: isActive ? '1px solid var(--green-primary)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 20,
                    color: isActive ? '#0d0b09' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: 12,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'var(--green-primary)';
                      e.currentTarget.style.color = '#fff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Listado de Platos en formato Lista Premium */}
        {filteredItems.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            marginBottom: 64,
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}>
            {filteredItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  padding: '24px 8px',
                  transition: 'background-color 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#fff',
                    fontFamily: "'Playfair Display', serif",
                    letterSpacing: '0.01em',
                    margin: 0
                  }}>{item.name}</h3>

                  {item.tag && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#c9a84c',
                      padding: '3px 8px',
                      background: 'rgba(201,168,76,0.06)',
                      border: '1px solid rgba(201,168,76,0.15)',
                      borderRadius: 4
                    }}>{item.tag}</span>
                  )}
                </div>
                
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.5',
                  margin: 0,
                  maxWidth: '720px'
                }}>{item.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 24px',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            marginBottom: 64
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 6 }}>No encontramos resultados</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>Intentá buscando otro plato o cambiá de categoría.</p>
          </div>
        )}

        {/* Footer del Menú */}
        <div style={{
          textAlign: 'center',
          padding: '40px 24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          color: 'var(--text-muted)',
          fontSize: 11
        }}>
          <p>© {new Date().getFullYear()} El Bodegón Club de Fidelidad. La oferta de platos puede variar según temporada.</p>
        </div>
      </div>
    </div>
  );
}
