"""Genera el Diagrama Entidad-Relación (DER) del CMS Sabor Marino con Graphviz.
Uso: python generar_der.py   (requiere Graphviz instalado: comando `dot`)"""
import subprocess, pathlib

HERE = pathlib.Path(__file__).parent

# (tabla, grupo, [(columna, tipo, marca)])  marca: PK, FK, UK o ''
TABLES = [
  ("roles", "seg", [("id","INTEGER","PK"),("name","TEXT","UK"),("description","TEXT","")]),
  ("users", "seg", [("id","INTEGER","PK"),("name","TEXT",""),("email","TEXT","UK"),("password_hash","TEXT",""),
                    ("is_active","INTEGER",""),("last_login_at","TEXT",""),("role_id","INTEGER","FK"),
                    ("created_at","TEXT",""),("updated_at","TEXT","")]),
  ("media", "med", [("id","INTEGER","PK"),("original_name","TEXT",""),("alt_text","TEXT",""),
                    ("uploaded_by_id","INTEGER","FK"),("created_at","TEXT","")]),
  ("media_variants", "med", [("id","INTEGER","PK"),("media_id","INTEGER","FK"),("size","TEXT",""),("width","INTEGER",""),
                    ("height","INTEGER",""),("path","TEXT",""),("size_bytes","INTEGER","")]),
  ("site_settings", "ide", [("id","INTEGER","PK"),("site_name","TEXT",""),("slogan","TEXT",""),("logo_id","INTEGER","FK"),
                    ("primary_color","TEXT",""),("secondary_color","TEXT",""),("accent_color","TEXT",""),
                    ("background_color","TEXT",""),("text_color","TEXT",""),("phone","TEXT",""),("whatsapp","TEXT",""),
                    ("email","TEXT",""),("address","TEXT",""),("map_embed_url","TEXT",""),("footer_text","TEXT",""),("updated_at","TEXT","")]),
  ("social_links", "ide", [("id","INTEGER","PK"),("platform","TEXT",""),("url","TEXT",""),("sort_order","INTEGER",""),("is_visible","INTEGER","")]),
  ("pages", "con", [("id","INTEGER","PK"),("title","TEXT",""),("slug","TEXT","UK"),("meta_description","TEXT",""),
                    ("is_home","INTEGER",""),("is_published","INTEGER",""),("author_id","INTEGER","FK"),
                    ("created_at","TEXT",""),("updated_at","TEXT","")]),
  ("page_components", "con", [("id","INTEGER","PK"),("page_id","INTEGER","FK"),("type","TEXT",""),("sort_order","INTEGER",""),
                    ("is_visible","INTEGER",""),("content","TEXT (JSON)",""),("created_at","TEXT",""),("updated_at","TEXT","")]),
  ("menus", "nav", [("id","INTEGER","PK"),("name","TEXT",""),("location","TEXT","UK")]),
  ("menu_items", "nav", [("id","INTEGER","PK"),("menu_id","INTEGER","FK"),("parent_id","INTEGER","FK"),("label","TEXT",""),
                    ("page_id","INTEGER","FK"),("url","TEXT",""),("sort_order","INTEGER",""),("is_visible","INTEGER","")]),
  ("categories", "car", [("id","INTEGER","PK"),("name","TEXT",""),("slug","TEXT","UK"),("description","TEXT",""),
                    ("sort_order","INTEGER",""),("is_active","INTEGER","")]),
  ("dishes", "car", [("id","INTEGER","PK"),("category_id","INTEGER","FK"),("name","TEXT",""),("description","TEXT",""),
                    ("price_cents","INTEGER",""),("image_id","INTEGER","FK"),("is_available","INTEGER",""),
                    ("is_featured","INTEGER",""),("sort_order","INTEGER",""),("created_at","TEXT",""),("updated_at","TEXT","")]),
]

# (hijo.col, padre) — relación 1 a muchos.  opcional=True si la FK acepta NULL
RELS = [
  ("users","role_id","roles",False),
  ("media","uploaded_by_id","users",True),
  ("media_variants","media_id","media",False),
  ("site_settings","logo_id","media",True),
  ("pages","author_id","users",True),
  ("page_components","page_id","pages",False),
  ("menu_items","menu_id","menus",False),
  ("menu_items","page_id","pages",True),
  ("menu_items","parent_id","menu_items",True),
  ("dishes","category_id","categories",False),
  ("dishes","image_id","media",True),
]

GROUPS = {
  "seg": ("Seguridad", "#0F4C75"),
  "med": ("Medios", "#5B6B7F"),
  "ide": ("Identidad visual", "#C0603F"),
  "con": ("Páginas y bloques", "#3282B8"),
  "nav": ("Navegación", "#2E7D6B"),
  "car": ("Carta del restaurante", "#8A5A2B"),
}

def node(name, group, cols):
    color = GROUPS[group][1]
    rows = []
    for c, t, m in cols:
        badge = {"PK": "PK", "FK": "FK", "UK": "UK"}.get(m, "")
        weight = "<B>%s</B>" % c if m == "PK" else c
        badge_cell = (f'<TD ALIGN="LEFT" PORT="{c}_out"><FONT COLOR="{color}"><B>{badge}</B></FONT></TD>' if badge else f'<TD PORT="{c}_out"> </TD>')
        rows.append(f'<TR><TD ALIGN="LEFT" PORT="{c}_in">{weight}</TD><TD ALIGN="LEFT"><FONT COLOR="#64748B">{t}</FONT></TD>'
                    f'{badge_cell}</TR>')
    return (f'"{name}" [label=<<TABLE BORDER="1" COLOR="{color}" CELLBORDER="0" CELLSPACING="0" CELLPADDING="4" BGCOLOR="white">'
            f'<TR><TD COLSPAN="3" BGCOLOR="{color}"><FONT COLOR="white"><B>{name}</B></FONT></TD></TR>'
            + "".join(rows) + "</TABLE>>];")

lines = ['digraph DER {',
         'graph [rankdir=LR, splines=spline, nodesep=0.5, ranksep=1.4, pad=0.4, bgcolor="white", fontname="Helvetica",'
         ' label=<<B>CMS Sabor Marino — Diagrama Entidad-Relación (3FN)</B><BR/><FONT POINT-SIZE="11" COLOR="#64748B">'
         'Motor: SQLite · PK = llave primaria · FK = llave foránea · UK = valor único · ——|&lt; uno a muchos · o = relación opcional</FONT>>,'
         ' labelloc=t, fontsize=20];',
         'node [shape=plain, fontname="Helvetica", fontsize=11];',
         'edge [color="#475569", penwidth=1.2, arrowsize=0.9];']
for g, (label, color) in GROUPS.items():
    lines.append(f'subgraph cluster_{g} {{ label=<<B>{label}</B>>; fontcolor="{color}"; color="{color}"; style="rounded,dashed"; fontsize=13;')
    for name, grp, cols in TABLES:
        if grp == g:
            lines.append(node(name, grp, cols))
    lines.append('}')
for child, col, parent, optional in RELS:
    tail = "crowodot" if optional else "crowtee"
    if parent == child:  # auto-relación (submenús): sale y entra por la derecha
        lines.append(f'"{parent}":id_out:e -> "{child}":{col}_out:e [dir=both, arrowtail=tee, arrowhead={tail}];')
    else:
        lines.append(f'"{parent}":id_out:e -> "{child}":{col}_in:w [dir=both, arrowtail=tee, arrowhead={tail}];')
lines.append('}')

dot_file = HERE / "der.dot"
dot_file.write_text("\n".join(lines), encoding="utf-8")
for fmt in ("png", "pdf", "svg"):
    args = ["dot", f"-T{fmt}", str(dot_file), "-o", str(HERE / f"DER_SaborMarino.{fmt}")]
    if fmt == "png":
        args.insert(1, "-Gdpi=170")
    subprocess.run(args, check=True)
print("DER generado: DER_SaborMarino.png / .pdf / .svg")
