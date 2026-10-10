// Datos de demostración del restaurante "Sabor Marino".
// Se cargan una sola vez, cuando la base de datos está vacía.
import bcrypt from 'bcryptjs';

const json = (obj) => JSON.stringify(obj);

export function seed(db) {
  // ---------- Roles y usuarios ----------
  const insertRole = db.prepare('INSERT INTO roles (name, description) VALUES (?, ?)');
  const adminRole = insertRole.run('ADMIN', 'Acceso total: apariencia, usuarios, contenido').lastInsertRowid;
  const editorRole = insertRole.run('EDITOR', 'Edita páginas, carta y medios. No gestiona usuarios ni apariencia').lastInsertRowid;

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, password_hash, role_id) VALUES (?, ?, ?, ?)'
  );
  const adminId = insertUser.run('Administrador', 'admin@sabormarino.pe', bcrypt.hashSync('Admin123*', 10), adminRole).lastInsertRowid;
  insertUser.run('Editor de contenido', 'editor@sabormarino.pe', bcrypt.hashSync('Editor123*', 10), editorRole);

  // ---------- Configuración global (look & feel) ----------
  db.prepare(`
    INSERT INTO site_settings (id, site_name, slogan, primary_color, secondary_color, accent_color,
      background_color, text_color, phone, whatsapp, email, address, map_embed_url, footer_text)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Sabor Marino',
    'Cebichería y cocina marina desde 1998',
    '#0F4C75', '#3282B8', '#F28C6B', '#FFFFFF', '#1E293B',
    '(01) 254-7788',
    '51999888777',
    'reservas@sabormarino.pe',
    'Av. Las Gaviotas 245, Chorrillos, Lima',
    'https://www.google.com/maps?q=Chorrillos,Lima,Peru&output=embed',
    '© Sabor Marino. Pescado fresco del día, todos los días.'
  );

  const insertSocial = db.prepare('INSERT INTO social_links (platform, url, sort_order) VALUES (?, ?, ?)');
  insertSocial.run('facebook', 'https://facebook.com/', 1);
  insertSocial.run('instagram', 'https://instagram.com/', 2);
  insertSocial.run('tiktok', 'https://tiktok.com/', 3);

  // ---------- Carta: categorías y platos ----------
  const insertCategory = db.prepare(
    'INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)'
  );
  const insertDish = db.prepare(`
    INSERT INTO dishes (category_id, name, description, price_cents, is_featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const carta = [
    ['Ceviches', 'ceviches', 'Pescado del día marinado al momento en limón de Chulucanas', [
      ['Ceviche clásico', 'Pescado fresco, limón, ají limo, cebolla roja, camote glaseado y choclo', 3800, 1],
      ['Ceviche mixto', 'Pescado, pulpo, calamar y langostinos en leche de tigre de la casa', 4500, 1],
      ['Tiradito al ají amarillo', 'Láminas finas de pescado bañadas en crema de ají amarillo', 3600, 0],
    ]],
    ['Entradas', 'entradas', 'Para abrir el apetito y compartir', [
      ['Leche de tigre', 'Concentrado de ceviche con trocitos de pescado y chicharrón de calamar', 2200, 0],
      ['Causa de langostinos', 'Masa de papa amarilla al limón rellena de palta y langostinos', 2800, 1],
      ['Choritos a la chalaca', 'Choros frescos con sarza de cebolla, tomate, rocoto y choclo', 2400, 0],
    ]],
    ['Platos de fondo', 'fondos', 'Clásicos de la cocina marina peruana', [
      ['Arroz con mariscos', 'Arroz meloso con mariscos, ají panca y un toque de pisco', 4200, 1],
      ['Jalea mixta', 'Pescado y mariscos crocantes con yuca frita y sarza criolla', 4800, 0],
      ['Chicharrón de pescado', 'Trozos de pescado apanados con salsa tártara de la casa', 3900, 0],
      ['Sudado de pescado', 'Filete al vapor en caldo de tomate, cebolla y chicha de jora', 4000, 0],
    ]],
    ['Bebidas', 'bebidas', 'Refrescos naturales y clásicos', [
      ['Chicha morada (jarra)', 'Preparada en casa con maíz morado, piña y canela', 1500, 0],
      ['Limonada frozen', 'Limón, hierbabuena y hielo frappé', 1200, 0],
      ['Pisco sour', 'Pisco quebranta, limón, jarabe y amargo de angostura', 2200, 0],
    ]],
    ['Postres', 'postres', 'El final dulce', [
      ['Suspiro a la limeña', 'Manjar blanco con merengue al oporto', 1400, 0],
      ['Picarones', 'Masa de zapallo y camote con miel de chancaca', 1500, 0],
    ]],
  ];

  carta.forEach(([name, slug, description, dishes], i) => {
    const categoryId = insertCategory.run(name, slug, description, i + 1).lastInsertRowid;
    dishes.forEach(([dName, dDesc, price, featured], j) => {
      insertDish.run(categoryId, dName, dDesc, price, featured, j + 1);
    });
  });

  // ---------- Páginas ----------
  const insertPage = db.prepare(`
    INSERT INTO pages (title, slug, meta_description, is_home, author_id) VALUES (?, ?, ?, ?, ?)
  `);
  const homeId = insertPage.run('Inicio', 'inicio', 'Cebichería Sabor Marino en Chorrillos: ceviches, causas y platos marinos con pescado del día.', 1, adminId).lastInsertRowid;
  const cartaId = insertPage.run('Carta', 'carta', 'Conoce la carta completa de Sabor Marino.', 0, adminId).lastInsertRowid;
  const nosotrosId = insertPage.run('Nosotros', 'nosotros', 'La historia de Sabor Marino.', 0, adminId).lastInsertRowid;
  const contactoId = insertPage.run('Contacto', 'contacto', 'Reservas, horarios y ubicación.', 0, adminId).lastInsertRowid;

  // ---------- Bloques (el contenido de cada uno va en JSON) ----------
  const insertBlock = db.prepare(
    'INSERT INTO page_components (page_id, type, sort_order, content) VALUES (?, ?, ?, ?)'
  );

  const schedule = {
    title: 'Horario de atención',
    items: [
      { days: 'Lunes a jueves', hours: '11:00 a. m. – 5:00 p. m.' },
      { days: 'Viernes a domingo', hours: '10:30 a. m. – 6:00 p. m.' },
    ],
    note: 'El pescado llega cada mañana del terminal de Villa María del Triunfo.',
  };

  // Inicio
  insertBlock.run(homeId, 'hero', 1, json({
    title: 'El mar llega fresco a tu mesa',
    subtitle: 'Ceviches, causas y arroces marinos preparados al momento, con pescado del día.',
    imageId: null,
    buttonText: 'Ver la carta',
    buttonLink: '/carta',
  }));
  insertBlock.run(homeId, 'menu', 2, json({
    title: 'Los favoritos de la casa',
    subtitle: 'Lo que más piden nuestros clientes',
    categoryIds: [],
    onlyFeatured: true,
  }));
  insertBlock.run(homeId, 'gallery', 3, json({ title: 'Nuestra cocina', imageIds: [] }));
  insertBlock.run(homeId, 'testimonials', 4, json({
    title: 'Lo que dicen de nosotros',
    items: [
      { name: 'Lucía M.', text: 'El ceviche mixto es de otro nivel. Volvemos cada domingo en familia.', rating: 5 },
      { name: 'Jorge R.', text: 'Atención rápida y el arroz con mariscos llega bien servido.', rating: 5 },
      { name: 'Andrea P.', text: 'La causa de langostinos y la chicha morada, infaltables.', rating: 4 },
    ],
  }));
  insertBlock.run(homeId, 'schedule', 5, json(schedule));

  // Carta
  insertBlock.run(cartaId, 'menu', 1, json({
    title: 'Nuestra carta',
    subtitle: 'Precios en soles. Consulta por el pescado del día.',
    categoryIds: [],
    onlyFeatured: false,
  }));

  // Nosotros
  insertBlock.run(nosotrosId, 'text', 1, json({
    title: 'Una historia que empezó en el muelle',
    body: 'Sabor Marino nació en 1998 como un pequeño puesto frente al muelle de Chorrillos. Hoy seguimos con la misma regla: si el pescado no llegó fresco esa mañana, no sale a la mesa.\nCada día compramos en el terminal de Villa María del Triunfo, cortamos al momento y marinamos con limón de Chulucanas. Nuestra cocina es la de casa: recetas de la familia que se han ido afinando con los años y con lo que nos piden nuestros clientes.',
    imageId: null,
    imagePosition: 'right',
  }));
  insertBlock.run(nosotrosId, 'testimonials', 2, json({
    title: 'Clientes de siempre',
    items: [
      { name: 'Don Carlos', text: 'Vengo desde que era un puestito. El sabor no ha cambiado.', rating: 5 },
      { name: 'Rosa T.', text: 'Celebramos aquí todos los cumpleaños de la familia. Siempre nos atienden como en casa.', rating: 5 },
      { name: 'Miguel A.', text: 'La jalea es crocante de verdad y la porción alcanza para compartir.', rating: 5 },
    ],
  }));

  // Contacto
  insertBlock.run(contactoId, 'contact', 1, json({
    title: 'Haz tu reserva',
    subtitle: 'Escríbenos por WhatsApp o visítanos en Chorrillos.',
    showMap: true,
    showWhatsapp: true,
  }));
  insertBlock.run(contactoId, 'schedule', 2, json(schedule));

  // ---------- Menús de navegación ----------
  const insertMenu = db.prepare('INSERT INTO menus (name, location) VALUES (?, ?)');
  const headerId = insertMenu.run('Menú principal', 'header').lastInsertRowid;
  const footerId = insertMenu.run('Menú del pie de página', 'footer').lastInsertRowid;

  const insertItem = db.prepare(
    'INSERT INTO menu_items (menu_id, label, page_id, url, sort_order) VALUES (?, ?, ?, ?, ?)'
  );
  [['Inicio', homeId], ['Carta', cartaId], ['Nosotros', nosotrosId], ['Contacto', contactoId]]
    .forEach(([label, pageId], i) => insertItem.run(headerId, label, pageId, null, i + 1));

  insertItem.run(footerId, 'Carta', cartaId, null, 1);
  insertItem.run(footerId, 'Contacto', contactoId, null, 2);
  insertItem.run(footerId, 'Reservar por WhatsApp', null, 'https://wa.me/51999888777', 3);
}
