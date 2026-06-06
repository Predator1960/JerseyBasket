/**
 * ============================================================
 * JerseyBasket.je — Channel Islands Grocery Price Comparison
 * ============================================================
 * Copyright © 2026 Eamonn O'Shea. All Rights Reserved.
 *
 * This source code is the proprietary and confidential
 * property of Eamonn O'Shea. Unauthorised copying,
 * modification, distribution, or use of this software,
 * via any medium, is strictly prohibited without the
 * express written permission of the owner.
 *
 * Built for Jersey, Channel Islands.
 * Contact: hello@jerseybasket.je
 *
 * Version:   v58
 * Updated:   2 June 2026
 * Changes:   Full glossy UI overhaul — welcome modal, submit price form added — pills, buttons, cards, header, competition banner
 *            in the header (e.g. for ethical/personal reasons). Hidden stores are
 *            removed from product cards, store pin chips, and basket comparisons.
 *            Setting persists for the session.
 * ============================================================
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   STORES
═══════════════════════════════════════════════════════════════════════════ */
const STORES = [
  { id:"coop",      name:"CI Co-op",  short:"Co-op",    tag:"Best Value", color:"#16a34a", emoji:"🌿", note:"Grande Marché, St Peter & branches" },
  { id:"morrisons", name:"Morrisons", short:"Morrisons",tag:"Convenience",color:"#eab308", emoji:"🛒", note:"The Parade, Benest's & branches" },
  { id:"ms",        name:"M&S Food",  short:"M&S",      tag:"Premium",    color:"#94a3b8", emoji:"✨", note:"St Helier (SandpiperCI)" },
  { id:"waitrose",  name:"Waitrose",  short:"Waitrose", tag:"Organic",    color:"#0d9488", emoji:"🌱", note:"St Saviour" },
  { id:"iceland",   name:"Iceland",   short:"Iceland",  tag:"Frozen",     color:"#dc2626", emoji:"🧊", note:"St Ouen & Broad St (via Alliance)" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════════════════════════════════ */
const CATS = [
  "All","🥛 Dairy & Eggs","🍞 Bread & Bakery","🥩 Meat & Fish",
  "🥦 Fruit & Veg","🧊 Frozen","🥤 Drinks","🍝 Pantry","🥨 Snacks & Treats",
  "🧹 Household","💊 Health & Beauty","🍼 Baby & Child",
  "🐾 Pet Care","🌱 Free From","🥔 Local Jersey","➕ Custom",
];

/* helper — spread prices from a base. Order: [coop, morrisons, ms, waitrose, iceland] */
const sp = (base,[c,m,ms2,w,i]) => ({
  coop:      Math.max(0,+(base+c  ).toFixed(2)),
  morrisons: Math.max(0,+(base+m  ).toFixed(2)),
  ms:        Math.max(0,+(base+ms2).toFixed(2)),
  waitrose:  Math.max(0,+(base+w  ).toFixed(2)),
  iceland:   Math.max(0,+(base+i  ).toFixed(2)),
});

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT DATABASE  (300 + items)
═══════════════════════════════════════════════════════════════════════════ */
const BASE_PRODUCTS = [

  /* ── DAIRY & EGGS ─────────────────────────────────────────────── */
  {id:1,  name:"Full Fat Milk (2L)",           cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.75,[1.53,0.14,0.35,0.24,0.07])},
  {id:2,  name:"Semi-Skimmed Milk (2L)",       cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.70,[1.58,-0.05,0.34,0.24,0.07])},
  {id:3,  name:"Skimmed Milk (2L)",            cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.65,[0,0.13,0.3,0.22,0.07])},
  {id:4,  name:"Oat Milk (1L)",                cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.60,[0,0.2,0.7,0.5,0.1])},
  {id:5,  name:"Almond Milk (1L)",             cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.55,[0,0.2,0.7,0.5,0.1])},
  {id:6,  name:"Soya Milk (1L)",               cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.45,[0,0.18,0.65,0.48,0.09])},
  {id:7,  name:"Coconut Milk Drink (1L)",      cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.65,[0,0.22,0.72,0.52,0.11])},
  {id:8,  name:"Free Range Eggs (6pk)",        cat:"🥛 Dairy & Eggs", icon:"🥚", prices:sp(1.85,[0,0.2,0.64,0.5,0.1])},
  {id:9,  name:"Free Range Eggs (12pk)",       cat:"🥛 Dairy & Eggs", icon:"🥚", prices:sp(3.40,[0,0.3,1,0.8,0.15])},
  {id:10, name:"Cheddar Mature (400g)",        cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.80,[0.85,0.0,0.6,0.4,0.07])},
  {id:11, name:"Cheddar Mild (400g)",          cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.60,[0,0.14,0.55,0.38,0.07])},
  {id:12, name:"Mozzarella (125g)",            cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(1.10,[0,0.15,0.45,0.35,0.07])},
  {id:13, name:"Brie (200g)",                  cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:14, name:"Parmesan (100g)",              cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.50,[0,-0.40,0.95,0.75,0.12])},
  {id:15, name:"Feta Cheese (200g)",           cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:16, name:"Butter Salted (250g)",         cat:"🥛 Dairy & Eggs", icon:"🧈", prices:sp(2.20,[0.15,0.15,0.6,0.45,0.07])},
  {id:17, name:"Butter Unsalted (250g)",       cat:"🥛 Dairy & Eggs", icon:"🧈", prices:sp(2.25,[0.10,0.15,0.6,0.45,0.07])},
  {id:18, name:"Spreadable Butter (500g)",     cat:"🥛 Dairy & Eggs", icon:"🧈", prices:sp(3.10,[1.45,0.22,0.85,0.65,0.11])},
  {id:19, name:"Greek Yoghurt (500g)",         cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.95,[0,0.05,0.65,0.45,0.07])},
  {id:20, name:"Natural Yoghurt (500g)",       cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.60,[0,0.15,0.55,0.4,0.07])},
  {id:21, name:"Fruit Yoghurts 4pk",           cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.80,[0,0.18,0.7,0.52,0.09])},
  {id:22, name:"Sour Cream (300ml)",           cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.40,[0,0.15,0.6,0.45,0.07])},
  {id:23, name:"Crème Fraîche (300ml)",        cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.60,[0,0.18,0.65,0.5,0.09])},
  {id:24, name:"Double Cream (300ml)",         cat:"🥛 Dairy & Eggs", icon:"🍦", prices:sp(1.60,[0.0,0.2,0.7,-0.09,0.1])},
  {id:25, name:"Single Cream (300ml)",         cat:"🥛 Dairy & Eggs", icon:"🍦", prices:sp(1.45,[0,0.18,0.65,0.5,0.09])},
  {id:26, name:"Cottage Cheese (300g)",        cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.50,[0,1.10,0.6,0.45,0.07])},
  {id:27, name:"Cream Cheese (200g)",          cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(1.80,[0.85,0.18,0.7,0.52,0.09])},
  {id:28, name:"Clotted Cream (113g)",         cat:"🥛 Dairy & Eggs", icon:"🍦", prices:sp(2.00,[0,0.22,0.8,0.6,0.11])},

  /* ── BREAD & BAKERY ───────────────────────────────────────────── */
  {id:29, name:"White Sliced Bread 800g",      cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(1.25,[0.50,-0.51,0.55,0.4,0.05])},
  {id:30, name:"Wholemeal Bread 800g",         cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(1.45,[0,0.1,0.55,0.4,0.05])},
  {id:31, name:"Seeded Batch Loaf",            cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(1.75,[-0.20,0.15,0.65,0.5,0.07])},
  {id:32, name:"Sourdough Loaf",               cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:33, name:"Gluten Free White Bread",      cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(2.90,[0,0.28,1,0.8,0.14])},
  {id:34, name:"Croissants (4pk)",             cat:"🍞 Bread & Bakery",icon:"🥐", prices:sp(1.80,[0,0.15,0.7,0.5,0.07])},
  {id:35, name:"Pain au Chocolat (4pk)",       cat:"🍞 Bread & Bakery",icon:"🥐", prices:sp(1.95,[0,0.2,0.8,0.6,0.1])},
  {id:36, name:"Bagels (5pk)",                 cat:"🍞 Bread & Bakery",icon:"🥯", prices:sp(1.50,[0,0.2,0.7,0.55,0.1])},
  {id:37, name:"Pitta Bread (6pk)",            cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.20,[0,-0.70,0.65,0.5,0.07])},
  {id:38, name:"Wraps / Tortillas (8pk)",      cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.60,[0,-0.20,0.7,0.55,0.07])},
  {id:39, name:"Naan Bread (4pk)",             cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.50,[0,0.19,0.65,0.5,0.07])},
  {id:40, name:"English Muffins (6pk)",        cat:"🍞 Bread & Bakery",icon:"🥯", prices:sp(1.40,[0,0.14,0.6,0.46,0.07])},
  {id:41, name:"Hot Dog Rolls (6pk)",          cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:42, name:"Burger Buns (4pk)",            cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(1.25,[0,0.12,0.52,0.4,0.06])},
  {id:43, name:"Ciabatta Rolls (4pk)",         cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(1.80,[0,0.18,0.72,0.55,0.09])},
  {id:44, name:"Crumpets (6pk)",               cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.10,[0.39,0.40,0.48,0.36,0.06])},
  {id:45, name:"Pancakes (6pk)",               cat:"🍞 Bread & Bakery",icon:"🥞", prices:sp(1.40,[0,0.14,0.58,0.44,0.07])},
  {id:46, name:"Waffles (6pk)",                cat:"🍞 Bread & Bakery",icon:"🧇", prices:sp(1.60,[0,0.16,0.62,0.47,0.08])},
  {id:47, name:"Scones (4pk)",                 cat:"🍞 Bread & Bakery",icon:"🥐", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},

  /* ── MEAT & FISH ──────────────────────────────────────────────── */
  {id:48, name:"Chicken Breast (500g)",        cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(3.80,[0.0,0.15,1.0,0.11,0.07])},
  {id:49, name:"Chicken Thighs (1kg)",         cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(3.20,[0,0.2,0.9,0.65,0.1])},
  {id:50, name:"Chicken Drumsticks (1kg)",     cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(2.80,[0,1.18,0.8,0.58,0.09])},
  {id:51, name:"Whole Chicken (~1.4kg)",       cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(5.50,[0,0.4,1.8,1.3,0.2])},
  {id:52, name:"Minced Beef (500g)",           cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.50,[0,-0.20,0.9,0.7,0.07])},
  {id:53, name:"Minced Beef (750g)",           cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(5.00,[0,0.2,1.3,1,0.1])},
  {id:54, name:"Beef Steak (200g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(5.50,[0,0.4,1.8,1.3,0.2])},
  {id:55, name:"Beef Burgers (4pk)",           cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.20,[0.0,0.22,0.98,1.4,0.11])},
  {id:56, name:"Pork Chops (2pk)",             cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.20,[0,0.2,0.9,0.7,0.1])},
  {id:57, name:"Pork Mince (500g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.00,[0,0.18,0.85,0.65,0.09])},
  {id:58, name:"Pork Ribs (500g)",             cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.80,[0,0.25,1,0.78,0.12])},
  {id:59, name:"Lamb Mince (500g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(4.50,[0,0.3,1.2,0.95,0.15])},
  {id:60, name:"Lamb Chops (2pk)",             cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(4.80,[0,0.35,1.3,1,0.17])},
  {id:61, name:"Back Bacon (200g)",            cat:"🥩 Meat & Fish",   icon:"🥓", prices:sp(2.50,[0,-1.01,0.7,0.5,0.07])},
  {id:62, name:"Streaky Bacon (200g)",         cat:"🥩 Meat & Fish",   icon:"🥓", prices:sp(2.30,[0,0.14,0.65,0.47,0.07])},
  {id:63, name:"Sausages Pork (8pk)",          cat:"🥩 Meat & Fish",   icon:"🌭", prices:sp(2.80,[0.35,0.2,0.8,0.6,0.1])},
  {id:64, name:"Chipolatas (12pk)",            cat:"🥩 Meat & Fish",   icon:"🌭", prices:sp(2.60,[0,0.18,0.76,0.57,0.09])},
  {id:65, name:"Chorizo (200g)",               cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(2.80,[0,0.22,0.88,0.68,0.11])},
  {id:66, name:"Salami (100g)",                cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(2.20,[0,0.18,0.75,0.57,0.09])},
  {id:67, name:"Ham Slices (120g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(1.80,[1.00,0.15,0.65,0.5,0.07])},
  {id:68, name:"Turkey Mince (500g)",          cat:"🥩 Meat & Fish",   icon:"🦃", prices:sp(3.40,[0,0.35,0.95,0.72,0.11])},
  {id:69, name:"Salmon Fillets (2pk)",         cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(4.20,[0,-0.14,1.3,1,0.12])},
  {id:70, name:"Smoked Salmon (100g)",         cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.20,[1.60,0.3,1.2,0.95,0.15])},
  {id:71, name:"Cod Fillets (2pk)",            cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.80,[0,0.25,1.2,0.9,0.12])},
  {id:72, name:"Haddock Fillets (2pk)",        cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.60,[0,0.24,1.15,0.88,0.12])},
  {id:73, name:"Tuna Steaks (2pk)",            cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(4.60,[0,0.3,1.4,1.1,0.15])},
  {id:74, name:"Prawns (200g)",                cat:"🥩 Meat & Fish",   icon:"🍤", prices:sp(3.60,[0,0.25,1.1,0.85,0.12])},
  {id:75, name:"Tuna Canned in Brine (145g)",  cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(0.95,[0,0.08,0.4,0.3,0.04])},
  {id:76, name:"Tuna Canned 4pk",              cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.50,[0,0.28,1.2,1,0.14])},
  {id:77, name:"Sardines Canned (120g)",       cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(0.85,[0,0.08,0.35,0.26,0.04])},
  {id:78, name:"Mackerel Fillets (125g)",      cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(1.20,[0,0.1,0.45,0.35,0.05])},
  {id:79, name:"Crab Sticks (200g)",           cat:"🥩 Meat & Fish",   icon:"🦀", prices:sp(1.80,[0,0.15,0.65,0.5,0.07])},

  /* ── FRUIT & VEG ──────────────────────────────────────────────── */
  {id:80, name:"Bananas (5pk)",                cat:"🥦 Fruit & Veg",  icon:"🍌", prices:sp(0.90,[-0.64,0.05,0.3,0.2,0.03])},
  {id:81, name:"Apples Braeburn (6pk)",        cat:"🥦 Fruit & Veg",  icon:"🍎", prices:sp(1.40,[2.20,0.15,0.55,0.4,0.07])},
  {id:82, name:"Apples Granny Smith (6pk)",    cat:"🥦 Fruit & Veg",  icon:"🍏", prices:sp(1.40,[0,0.15,0.55,0.4,0.07])},
  {id:83, name:"Oranges (4pk)",                cat:"🥦 Fruit & Veg",  icon:"🍊", prices:sp(1.50,[0,0.15,0.6,0.45,0.07])},
  {id:84, name:"Satsumas (700g bag)",          cat:"🥦 Fruit & Veg",  icon:"🍊", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:85, name:"Lemons (4pk)",                 cat:"🥦 Fruit & Veg",  icon:"🍋", prices:sp(0.90,[0,0.1,0.38,0.28,0.05])},
  {id:86, name:"Limes (4pk)",                  cat:"🥦 Fruit & Veg",  icon:"🍋", prices:sp(0.90,[0,0.1,0.38,0.28,0.05])},
  {id:87, name:"Strawberries (400g)",          cat:"🥦 Fruit & Veg",  icon:"🍓", prices:sp(2.50,[-0.65,0.2,0.9,0.7,0.1])},
  {id:88, name:"Raspberries (150g)",           cat:"🥦 Fruit & Veg",  icon:"🍓", prices:sp(2.20,[0,0.2,0.85,0.65,0.1])},
  {id:89, name:"Blueberries (150g)",           cat:"🥦 Fruit & Veg",  icon:"🫐", prices:sp(2.20,[0,0.2,0.85,0.65,0.1])},
  {id:90, name:"Grapes White (500g)",          cat:"🥦 Fruit & Veg",  icon:"🍇", prices:sp(2.20,[0,0.2,0.8,0.65,0.1])},
  {id:91, name:"Grapes Red (500g)",            cat:"🥦 Fruit & Veg",  icon:"🍇", prices:sp(2.20,[0,0.2,0.8,0.65,0.1])},
  {id:92, name:"Avocados (2pk)",               cat:"🥦 Fruit & Veg",  icon:"🥑", prices:sp(1.80,[0,0.2,0.8,0.6,0.1])},
  {id:93, name:"Melon Cantaloupe (half)",      cat:"🥦 Fruit & Veg",  icon:"🍈", prices:sp(1.40,[0,0.15,0.55,0.42,0.07])},
  {id:94, name:"Mango (each)",                 cat:"🥦 Fruit & Veg",  icon:"🥭", prices:sp(0.85,[0,0.1,0.38,0.28,0.05])},
  {id:95, name:"Pineapple (each)",             cat:"🥦 Fruit & Veg",  icon:"🍍", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:96, name:"Kiwi Fruit (4pk)",             cat:"🥦 Fruit & Veg",  icon:"🥝", prices:sp(0.95,[0,0.1,0.4,0.3,0.05])},
  {id:97, name:"Broccoli (head)",              cat:"🥦 Fruit & Veg",  icon:"🥦", prices:sp(0.85,[0.6,0.05,0.3,0.2,0.03])},
  {id:98, name:"Cauliflower (head)",           cat:"🥦 Fruit & Veg",  icon:"🥦", prices:sp(0.95,[0.65,0.08,0.35,0.26,0.04])},
  {id:99, name:"Bag of Spinach (200g)",        cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(1.25,[0,0.1,0.5,0.35,0.05])},
  {id:100,name:"Kale (200g)",                  cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(1.30,[0,0.12,0.5,0.38,0.06])},
  {id:101,name:"Mixed Salad Leaves (100g)",    cat:"🥦 Fruit & Veg",  icon:"🥗", prices:sp(1.10,[0,0.1,0.42,0.32,0.05])},
  {id:102,name:"Rocket (100g)",               cat:"🥦 Fruit & Veg",  icon:"🥗", prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:103,name:"Mixed Peppers (3pk)",          cat:"🥦 Fruit & Veg",  icon:"🫑", prices:sp(1.60,[0,0.15,0.6,0.4,0.07])},
  {id:104,name:"Red Pepper (each)",            cat:"🥦 Fruit & Veg",  icon:"🫑", prices:sp(0.65,[0,0.07,0.28,0.2,0.04])},
  {id:105,name:"Carrots (1kg)",                cat:"🥦 Fruit & Veg",  icon:"🥕", prices:sp(0.70,[0,0.08,0.3,0.22,0.04])},
  {id:106,name:"Parsnips (500g)",              cat:"🥦 Fruit & Veg",  icon:"🥕", prices:sp(0.90,[0,0.09,0.35,0.26,0.04])},
  {id:107,name:"Onions (1kg)",                 cat:"🥦 Fruit & Veg",  icon:"🧅", prices:sp(0.80,[0.25,0.1,0.35,0.25,0.05])},
  {id:108,name:"Spring Onions (bunch)",        cat:"🥦 Fruit & Veg",  icon:"🧅", prices:sp(0.60,[0,0.07,0.28,0.2,0.04])},
  {id:109,name:"Red Onions (3pk)",             cat:"🥦 Fruit & Veg",  icon:"🧅", prices:sp(0.90,[0,0.09,0.35,0.26,0.04])},
  {id:110,name:"Garlic (3 bulbs)",             cat:"🥦 Fruit & Veg",  icon:"🧄", prices:sp(0.75,[0,0.1,0.35,0.25,0.05])},
  {id:111,name:"Cherry Tomatoes (250g)",       cat:"🥦 Fruit & Veg",  icon:"🍅", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:112,name:"Vine Tomatoes (500g)",         cat:"🥦 Fruit & Veg",  icon:"🍅", prices:sp(1.30,[0,0.12,0.5,0.38,0.06])},
  {id:113,name:"Cucumber (each)",              cat:"🥦 Fruit & Veg",  icon:"🥒", prices:sp(0.65,[0,0.08,0.3,0.22,0.04])},
  {id:114,name:"Courgette (2pk)",              cat:"🥦 Fruit & Veg",  icon:"🥒", prices:sp(0.90,[0,0.1,0.4,0.3,0.05])},
  {id:115,name:"Aubergine (each)",             cat:"🥦 Fruit & Veg",  icon:"🍆", prices:sp(0.80,[0,0.08,0.32,0.24,0.04])},
  {id:116,name:"Butternut Squash (each)",      cat:"🥦 Fruit & Veg",  icon:"🎃", prices:sp(1.00,[0,0.1,0.4,0.3,0.05])},
  {id:117,name:"Sweet Potatoes (750g)",        cat:"🥦 Fruit & Veg",  icon:"🍠", prices:sp(1.30,[0,0.15,0.55,0.4,0.07])},
  {id:118,name:"Mushrooms (250g)",             cat:"🥦 Fruit & Veg",  icon:"🍄", prices:sp(1.10,[0,0.1,0.45,0.35,0.05])},
  {id:119,name:"Celery (head)",                cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(0.90,[0,0.1,0.38,0.28,0.05])},
  {id:120,name:"Lettuce Iceberg (each)",       cat:"🥦 Fruit & Veg",  icon:"🥗", prices:sp(0.75,[0,0.08,0.3,0.22,0.04])},
  {id:121,name:"Asparagus (200g)",             cat:"🥦 Fruit & Veg",  icon:"🥦", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:122,name:"Sweetcorn (2pk)",              cat:"🥦 Fruit & Veg",  icon:"🌽", prices:sp(0.90,[0,0.09,0.36,0.26,0.04])},
  {id:123,name:"Leek (each)",                  cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(0.55,[0,0.06,0.24,0.18,0.03])},
  {id:124,name:"White Potatoes (2.5kg)",       cat:"🥦 Fruit & Veg",  icon:"🥔", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:125,name:"Baby New Potatoes (500g)",     cat:"🥦 Fruit & Veg",  icon:"🥔", prices:sp(1.10,[0,0.1,0.42,0.32,0.05])},
  {id:126,name:"Chilli (3pk)",                 cat:"🥦 Fruit & Veg",  icon:"🌶️", prices:sp(0.65,[0,0.07,0.28,0.2,0.04])},
  {id:127,name:"Ginger Root (piece)",          cat:"🥦 Fruit & Veg",  icon:"🫚", prices:sp(0.45,[0,0.05,0.2,0.15,0.03])},

  /* ── FROZEN ───────────────────────────────────────────────────── */
  {id:128,name:"Frozen Peas (900g)",           cat:"🧊 Frozen",       icon:"🟢", prices:sp(1.80,[1.60,0.18,0.7,0.55,0.09])},
  {id:129,name:"Frozen Peas & Sweetcorn (1kg)",cat:"🧊 Frozen",       icon:"🟢", prices:sp(1.60,[0,0.16,0.65,0.5,0.08])},
  {id:130,name:"Frozen Chips Straight (1.5kg)",cat:"🧊 Frozen",       icon:"🍟", prices:sp(2.20,[-0.10,0.2,0.8,0.6,0.1])},
  {id:131,name:"Frozen Chips Crinkle (1kg)",   cat:"🧊 Frozen",       icon:"🍟", prices:sp(1.90,[0,0.18,0.72,0.55,0.09])},
  {id:132,name:"Frozen Oven Pizza (Margherita)",cat:"🧊 Frozen",      icon:"🍕", prices:sp(2.50,[1.95,0.50,0.95,0.75,0.12])},
  {id:133,name:"Frozen Oven Pizza (Pepperoni)", cat:"🧊 Frozen",      icon:"🍕", prices:sp(2.80,[1.65,0.70,1,0.8,0.14])},
  {id:134,name:"Ice Cream Vanilla (1L)",       cat:"🧊 Frozen",       icon:"🍨", prices:sp(3.00,[0.15,0.3,1.1,0.85,0.15])},
  {id:135,name:"Ice Cream Tub Luxury (500ml)", cat:"🧊 Frozen",       icon:"🍨", prices:sp(3.80,[0.15,0.38,1.35,1.05,0.19])},
  {id:136,name:"Frozen Fish Fingers (12pk)",   cat:"🧊 Frozen",       icon:"🐟", prices:sp(2.80,[-0.25,0.25,1.0,0.8,0.12])},
  {id:137,name:"Frozen Salmon Fillets (4pk)",  cat:"🧊 Frozen",       icon:"🐟", prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:138,name:"Frozen Cod Fillets (4pk)",     cat:"🧊 Frozen",       icon:"🐟", prices:sp(4.80,[0,0.44,1.6,1.22,0.22])},
  {id:139,name:"Frozen Prawns (400g)",         cat:"🧊 Frozen",       icon:"🍤", prices:sp(4.50,[0,0.4,1.4,1.1,0.2])},
  {id:140,name:"Frozen Berries Mixed (500g)",  cat:"🧊 Frozen",       icon:"🍓", prices:sp(2.40,[0,0.22,0.85,0.65,0.11])},
  {id:141,name:"Frozen Edamame (500g)",        cat:"🧊 Frozen",       icon:"🫘", prices:sp(2.20,[0,0.22,0.8,0.6,0.11])},
  {id:143,name:"Frozen Mince Beef (900g)",     cat:"🧊 Frozen",       icon:"🥩", prices:sp(5.80,[0,0.5,1.8,1.4,0.25])},
  {id:144,name:"Frozen Garlic Bread (2pk)",    cat:"🧊 Frozen",       icon:"🍞", prices:sp(1.50,[-0.20,0.15,0.6,0.46,0.07])},
  {id:146,name:"Frozen Vegetarian Burgers 4pk",cat:"🧊 Frozen",       icon:"🍔", prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:147,name:"Frozen Yorkshire Puddings 9pk",cat:"🧊 Frozen",       icon:"🍳", prices:sp(1.50,[0,0.15,0.58,0.44,0.07])},

  /* ── DRINKS ───────────────────────────────────────────────────── */
  {id:148,name:"Orange Juice (1L)",            cat:"🥤 Drinks",       icon:"🍊", prices:sp(1.65,[0,0.1,0.5,0.35,0.05])},
  {id:149,name:"Apple Juice (1L)",             cat:"🥤 Drinks",       icon:"🍏", prices:sp(1.55,[0,0.1,0.5,0.35,0.05])},
  {id:150,name:"Cranberry Juice (1L)",         cat:"🥤 Drinks",       icon:"🍷", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:151,name:"Pineapple Juice (1L)",         cat:"🥤 Drinks",       icon:"🍍", prices:sp(1.65,[0,0.16,0.65,0.5,0.08])},
  {id:152,name:"Still Water (1.5L)",           cat:"🥤 Drinks",       icon:"💧", prices:sp(0.55,[0,0.08,0.3,0.22,0.04])},
  {id:153,name:"Sparkling Water (1.5L)",       cat:"🥤 Drinks",       icon:"💧", prices:sp(0.65,[0,0.08,0.3,0.22,0.04])},
  {id:154,name:"Coca-Cola (1.75L)",            cat:"🥤 Drinks",       icon:"🥤", prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:155,name:"Pepsi Max (1.75L)",            cat:"🥤 Drinks",       icon:"🥤", prices:sp(2.10,[1.55,0.2,0.78,0.44,0.1])},
  {id:156,name:"Lemonade (2L)",                cat:"🥤 Drinks",       icon:"🥤", prices:sp(0.95,[0,0.1,0.38,0.28,0.05])},
  {id:157,name:"Fanta Orange (1.5L)",          cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.65,[0,0.16,0.65,0.5,0.08])},
  {id:158,name:"Sprite (1.5L)",                cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.65,[0,0.16,0.65,0.5,0.08])},
  {id:159,name:"Lucozade Sport (500ml)",       cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:160,name:"Energy Drink 250ml (4pk)",     cat:"🥤 Drinks",       icon:"⚡", prices:sp(3.20,[0,0.3,1.15,0.88,0.15])},
  {id:161,name:"Filter Coffee (227g)",         cat:"🥤 Drinks",       icon:"☕", prices:sp(3.20,[0,0.2,1,0.75,0.1])},
  {id:162,name:"Instant Coffee (100g)",        cat:"🥤 Drinks",       icon:"☕", prices:sp(3.50,[0,0.3,1.2,0.95,0.15])},
  {id:163,name:"Coffee Pods (16pk)",           cat:"🥤 Drinks",       icon:"☕", prices:sp(4.50,[0,0.4,1.45,1.12,0.2])},
  {id:164,name:"Tea Bags (80pk)",              cat:"🥤 Drinks",       icon:"🫖", prices:sp(2.50,[0,0.2,0.85,0.65,0.1])},
  {id:165,name:"Tea Bags (160pk)",             cat:"🥤 Drinks",       icon:"🫖", prices:sp(4.50,[0,0.38,1.45,1.12,0.19])},
  {id:166,name:"Green Tea Bags (40pk)",        cat:"🥤 Drinks",       icon:"🍵", prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:167,name:"Herbal Tea Variety (20pk)",    cat:"🥤 Drinks",       icon:"🍵", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:168,name:"Hot Chocolate Powder (400g)",  cat:"🥤 Drinks",       icon:"☕", prices:sp(3.50,[0,0.3,1.2,0.95,0.15])},
  {id:169,name:"Red Wine Bottle (75cl)",       cat:"🥤 Drinks",       icon:"🍷", prices:sp(6.50,[0.75,0.5,2,1.6,0.25])},
  {id:170,name:"White Wine Bottle (75cl)",     cat:"🥤 Drinks",       icon:"🍾", prices:sp(6.00,[0.5,0.5,2,1.6,0.25])},
  {id:171,name:"Rosé Wine Bottle (75cl)",      cat:"🥤 Drinks",       icon:"🌸", prices:sp(6.20,[1.05,0.52,2.05,1.62,0.26])},
  {id:172,name:"Prosecco (75cl)",              cat:"🥤 Drinks",       icon:"🥂", prices:sp(8.00,[-1.5,0.7,2.5,2,0.35])},
  {id:173,name:"Beer Lager 4pk (440ml)",       cat:"🥤 Drinks",       icon:"🍺", prices:sp(4.20,[0,-0.20,1.5,1.2,0.2])},
  {id:174,name:"Craft Beer 4pk (330ml)",       cat:"🥤 Drinks",       icon:"🍺", prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:175,name:"Gin (70cl)",                   cat:"🥤 Drinks",       icon:"🍸", prices:sp(18.0,[0,1.5,5,4,0.75])},
  {id:176,name:"Vodka (70cl)",                 cat:"🥤 Drinks",       icon:"🍸", prices:sp(15.0,[0,1.10,4.5,3.5,0.6])},
  {id:177,name:"Whisky (70cl)",                cat:"🥤 Drinks",       icon:"🥃", prices:sp(20.0,[0,1.8,6,4.8,0.9])},
  {id:178,name:"Rum (70cl)",                   cat:"🥤 Drinks",       icon:"🍸", prices:sp(14.0,[0,1.1,4.2,3.3,0.55])},
  {id:179,name:"Squash (1L)",                  cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.50,[0.6,0.15,0.6,0.46,0.07])},

  /* ── PANTRY ───────────────────────────────────────────────────── */
  {id:180,name:"Pasta Penne (500g)",           cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.89,[0.06,0.06,0.41,0.26,0.03])},
  {id:181,name:"Spaghetti (500g)",             cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.89,[0.06,0.06,0.41,0.26,0.03])},
  {id:182,name:"Fusilli (500g)",               cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.89,[0.06,0.06,0.41,0.26,0.03])},
  {id:183,name:"Tagliatelle (500g)",           cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.95,[0.0,0.08,0.42,0.28,0.04])},
  {id:184,name:"Tinned Tomatoes (400g)",       cat:"🍝 Pantry",       icon:"🍅", prices:sp(0.65,[0.0,-0.18,0.34,0.25,0.03])},
  {id:185,name:"Tinned Tomatoes (4pk)",        cat:"🍝 Pantry",       icon:"🍅", prices:sp(2.40,[0,0.18,1.2,0.95,0.09])},
  {id:186,name:"Passata (680g)",               cat:"🍝 Pantry",       icon:"🍅", prices:sp(0.90,[0,0.09,0.36,0.28,0.04])},
  {id:187,name:"Tinned Chickpeas (400g)",      cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.75,[0,0.08,0.38,0.28,0.04])},
  {id:188,name:"Tinned Kidney Beans (400g)",   cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.70,[0,0.07,0.36,0.26,0.04])},
  {id:189,name:"Tinned Lentils (400g)",        cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.80,[0,0.08,0.38,0.28,0.04])},
  {id:190,name:"Tinned Baked Beans (415g)",    cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.70,[0.0,0.06,0.25,0.15,0.03])},
  {id:191,name:"Tinned Sweetcorn (340g)",      cat:"🍝 Pantry",       icon:"🌽", prices:sp(0.65,[0,0.08,0.32,0.24,0.04])},
  {id:192,name:"Tinned Coconut Milk (400ml)",  cat:"🍝 Pantry",       icon:"🥥", prices:sp(1.10,[0,0.1,0.45,0.34,0.05])},
  {id:193,name:"Olive Oil Extra Virgin (500ml)",cat:"🍝 Pantry",      icon:"🫒", prices:sp(3.80,[0,0.19,1.2,0.95,0.1])},
  {id:194,name:"Sunflower Oil (1L)",           cat:"🍝 Pantry",       icon:"🌻", prices:sp(2.20,[0.35,0.18,0.9,0.7,0.09])},
  {id:195,name:"Vegetable Oil (1L)",           cat:"🍝 Pantry",       icon:"🌻", prices:sp(1.90,[2.49,0.16,0.78,0.6,0.08])},
  {id:196,name:"Basmati Rice (1kg)",           cat:"🍝 Pantry",       icon:"🍚", prices:sp(1.80,[0.0,0.15,0.7,0.5,0.07])},
  {id:197,name:"Long Grain Rice (1kg)",        cat:"🍝 Pantry",       icon:"🍚", prices:sp(1.60,[0,0.14,0.65,0.48,0.07])},
  {id:198,name:"Microwave Rice (3pk)",         cat:"🍝 Pantry",       icon:"🍚", prices:sp(2.40,[0,0.22,0.88,0.68,0.11])},
  {id:199,name:"Porridge Oats (500g)",         cat:"🍝 Pantry",       icon:"🌾", prices:sp(1.30,[-0.5,0.12,0.5,0.38,0.06])},
  {id:200,name:"Porridge Oats (1kg)",          cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.20,[0,0.2,0.85,0.65,0.1])},
  {id:201,name:"Cornflakes (500g)",            cat:"🍝 Pantry",       icon:"🌽", prices:sp(1.60,[0,0.15,0.6,0.45,0.07])},
  {id:202,name:"Weetabix (24pk)",              cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.80,[0,0.25,0.98,0.76,0.12])},
  {id:203,name:"Muesli (500g)",                cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.50,[0,0.22,0.88,0.68,0.11])},
  {id:204,name:"Granola (500g)",               cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.80,[0,0.25,0.98,0.76,0.12])},
  {id:205,name:"Plain Flour (1.5kg)",          cat:"🍝 Pantry",       icon:"🌾", prices:sp(1.20,[-0.15,0.12,0.5,0.38,0.06])},
  {id:206,name:"Self Raising Flour (1.5kg)",   cat:"🍝 Pantry",       icon:"🌾", prices:sp(1.25,[-0.2,0.12,0.5,0.38,0.06])},
  {id:207,name:"Sugar White (1kg)",            cat:"🍝 Pantry",       icon:"🍬", prices:sp(1.00,[0.35,0.1,0.38,0.28,0.05])},
  {id:208,name:"Caster Sugar (1kg)",           cat:"🍝 Pantry",       icon:"🍬", prices:sp(1.10,[1.25,0.1,0.4,0.3,0.05])},
  {id:209,name:"Icing Sugar (500g)",           cat:"🍝 Pantry",       icon:"🍬", prices:sp(0.90,[0.0,0.09,0.35,0.26,0.04])},
  {id:210,name:"Tomato Ketchup (460g)",        cat:"🍝 Pantry",       icon:"🍅", prices:sp(1.80,[0,0.18,0.7,0.55,0.09])},
  {id:211,name:"Mayonnaise (400g)",            cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.90,[0,0.18,0.75,0.58,0.09])},
  {id:212,name:"Brown Sauce (400ml)",          cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.60,[0.4,0.16,0.65,0.5,0.08])},
  {id:213,name:"English Mustard (185g)",       cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.40,[0,0.14,0.58,0.44,0.07])},
  {id:214,name:"Dijon Mustard (200g)",         cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.60,[0,0.16,0.65,0.5,0.08])},
  {id:215,name:"Soy Sauce (150ml)",            cat:"🍝 Pantry",       icon:"🍶", prices:sp(1.30,[0,0.14,0.5,0.38,0.07])},
  {id:216,name:"Worcestershire Sauce (150ml)", cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:217,name:"Vinegar Malt (568ml)",         cat:"🍝 Pantry",       icon:"🥄", prices:sp(0.95,[0,0.09,0.38,0.28,0.04])},
  {id:218,name:"Balsamic Vinegar (250ml)",     cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:219,name:"Stock Cubes Beef (12pk)",      cat:"🍝 Pantry",       icon:"🫙", prices:sp(1.20,[1.8,0.12,0.48,0.36,0.06])},
  {id:220,name:"Stock Cubes Chicken (12pk)",   cat:"🍝 Pantry",       icon:"🫙", prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:221,name:"Stock Cubes Veg (12pk)",       cat:"🍝 Pantry",       icon:"🫙", prices:sp(1.10,[0,0.11,0.44,0.33,0.06])},
  {id:222,name:"Honey (340g)",                 cat:"🍝 Pantry",       icon:"🍯", prices:sp(2.80,[0.09,0.25,1,0.8,0.12])},
  {id:223,name:"Peanut Butter Smooth (340g)",  cat:"🍝 Pantry",       icon:"🥜", prices:sp(2.50,[0,0.22,0.88,0.68,0.11])},
  {id:224,name:"Peanut Butter Crunchy (340g)", cat:"🍝 Pantry",       icon:"🥜", prices:sp(2.50,[-0.4,0.22,0.88,0.68,0.11])},
  {id:225,name:"Strawberry Jam (454g)",        cat:"🍝 Pantry",       icon:"🍓", prices:sp(1.80,[-0.21,0.18,0.7,0.55,0.09])},
  {id:226,name:"Marmalade (454g)",             cat:"🍝 Pantry",       icon:"🍊", prices:sp(1.80,[-0.61,0.18,0.7,0.55,0.09])},
  {id:227,name:"Nutella (400g)",               cat:"🍝 Pantry",       icon:"🍫", prices:sp(3.20,[0,0.28,1.1,0.85,0.14])},
  {id:228,name:"Pasta Sauce Tomato (500g)",    cat:"🍝 Pantry",       icon:"🍅", prices:sp(1.50,[0,0.15,0.6,0.45,0.07])},
  {id:229,name:"Pasta Sauce Bolognese (500g)", cat:"🍝 Pantry",       icon:"🍅", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:230,name:"Curry Paste Medium (283g)",    cat:"🍝 Pantry",       icon:"🍛", prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:231,name:"Coconut Cream (200ml)",        cat:"🍝 Pantry",       icon:"🥥", prices:sp(0.90,[0,0.09,0.36,0.27,0.04])},
  {id:232,name:"Noodles Instant (4pk)",        cat:"🍝 Pantry",       icon:"🍜", prices:sp(0.90,[0,0.09,0.36,0.27,0.04])},
  {id:233,name:"Baking Powder (150g)",         cat:"🍝 Pantry",       icon:"🌾", prices:sp(0.85,[0,0.08,0.32,0.24,0.04])},
  {id:234,name:"Bicarbonate of Soda (200g)",   cat:"🍝 Pantry",       icon:"🌾", prices:sp(0.80,[0,0.08,0.3,0.22,0.04])},
  {id:235,name:"Vanilla Extract (60ml)",       cat:"🍝 Pantry",       icon:"🫙", prices:sp(2.20,[0,0.22,0.88,0.68,0.11])},
  {id:236,name:"Cocoa Powder (250g)",          cat:"🍝 Pantry",       icon:"🍫", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:237,name:"Cornflour (250g)",             cat:"🍝 Pantry",       icon:"🌾", prices:sp(0.80,[0.65,0.08,0.3,0.22,0.04])},
  {id:238,name:"Dried Pasta Mixed 3kg",        cat:"🍝 Pantry",       icon:"🍝", prices:sp(4.50,[0,0.38,1.45,1.12,0.19])},

  /* ── SNACKS & TREATS ──────────────────────────────────────────── */
  {id:239,name:"Crisps Multipack (6pk)",       cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:240,name:"Crisps Large Sharing Bag",     cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(2.20,[-0.9,0.22,0.85,0.65,0.11])},
  {id:241,name:"Tortilla Chips (200g)",        cat:"🥨 Snacks & Treats",icon:"🌮",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:242,name:"Salsa Dip (300g)",             cat:"🥨 Snacks & Treats",icon:"🌮",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},
  {id:243,name:"Hummus (200g)",                cat:"🥨 Snacks & Treats",icon:"🥙",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:244,name:"Digestive Biscuits (400g)",    cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:245,name:"Hobnobs (300g)",               cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:246,name:"Shortbread Fingers (160g)",    cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:247,name:"Rich Tea Biscuits (300g)",     cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.10,[0,0.11,0.44,0.33,0.06])},
  {id:248,name:"Chocolate Digestives (300g)",  cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},
  {id:249,name:"Chocolate Bar Milk (100g)",    cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.50,[0,0.15,0.6,0.45,0.07])},
  {id:250,name:"Chocolate Bar Dark (100g)",    cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},
  {id:251,name:"Chocolate Fingers (114g)",     cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:252,name:"Kit Kat 4pk",                  cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.30,[0.64,0.13,0.52,0.4,0.07])},
  {id:253,name:"Mixed Nuts (200g)",            cat:"🥨 Snacks & Treats",icon:"🥜",prices:sp(2.80,[0,0.25,0.95,0.75,0.12])},
  {id:254,name:"Cashew Nuts (200g)",           cat:"🥨 Snacks & Treats",icon:"🥜",prices:sp(3.20,[0,0.28,1.1,0.85,0.14])},
  {id:255,name:"Cereal Bars 5pk",              cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:256,name:"Rice Cakes Plain (130g)",      cat:"🥨 Snacks & Treats",icon:"🍘",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:257,name:"Popcorn (100g)",               cat:"🥨 Snacks & Treats",icon:"🍿",prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:258,name:"Sweets Pick n Mix (200g)",     cat:"🥨 Snacks & Treats",icon:"🍬",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:259,name:"Jelly Babies (190g)",          cat:"🥨 Snacks & Treats",icon:"🍬",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:260,name:"Fruit Pastilles (52g roll)",   cat:"🥨 Snacks & Treats",icon:"🍬",prices:sp(0.80,[0,0.08,0.32,0.24,0.04])},
  {id:261,name:"Kettle Chips (150g)",          cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(1.80,[1.0,0.18,0.7,0.54,0.09])},
  {id:262,name:"Pretzels (175g)",              cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},

  /* ── HOUSEHOLD ────────────────────────────────────────────────── */
  {id:263,name:"Washing Up Liquid (500ml)",    cat:"🧹 Household",    icon:"🧴", prices:sp(1.20,[0.0,0.15,0.55,0.4,0.07])},
  {id:264,name:"Washing Up Liquid (900ml)",    cat:"🧹 Household",    icon:"🧴", prices:sp(2.00,[0,0.22,0.85,0.65,0.11])},
  {id:265,name:"Laundry Liquid (800ml)",       cat:"🧹 Household",    icon:"🫧", prices:sp(5.50,[-2.75,0.5,1.8,1.4,0.25])},
  {id:266,name:"Laundry Tablets (30pk)",       cat:"🧹 Household",    icon:"🫧", prices:sp(7.50,[0,0.7,2.5,2,0.35])},
  {id:267,name:"Laundry Capsules (32pk)",      cat:"🧹 Household",    icon:"🫧", prices:sp(8.50,[-1.75,0.8,2.8,2.2,0.4])},
  {id:268,name:"Fabric Conditioner (1L)",      cat:"🧹 Household",    icon:"🫧", prices:sp(3.80,[-1.9,0.35,1.3,1,0.17])},
  {id:269,name:"Toilet Rolls (9pk)",           cat:"🧹 Household",    icon:"🧻", prices:sp(4.50,[-0.1,0.4,1.6,1.2,0.2])},
  {id:270,name:"Toilet Rolls (24pk)",          cat:"🧹 Household",    icon:"🧻", prices:sp(10.0,[0,0.88,3.5,2.7,0.44])},
  {id:271,name:"Kitchen Roll (2pk)",           cat:"🧹 Household",    icon:"🧻", prices:sp(1.80,[-0.15,0.18,0.7,0.55,0.09])},
  {id:272,name:"Bin Bags (30pk)",              cat:"🧹 Household",    icon:"🗑️", prices:sp(2.50,[0,0.25,0.9,0.7,0.12])},
  {id:273,name:"Freezer Bags (50pk)",          cat:"🧹 Household",    icon:"📦", prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:276,name:"Sandwich Bags (50pk)",         cat:"🧹 Household",    icon:"📦", prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:277,name:"All-Purpose Spray (500ml)",    cat:"🧹 Household",    icon:"🧹", prices:sp(1.90,[-0.7,0.18,0.72,0.55,0.09])},
  {id:278,name:"Bleach (750ml)",               cat:"🧹 Household",    icon:"🧹", prices:sp(1.10,[0.1,0.11,0.44,0.33,0.06])},
  {id:279,name:"Bathroom Cleaner (500ml)",     cat:"🧹 Household",    icon:"🧹", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:280,name:"Floor Cleaner (1L)",           cat:"🧹 Household",    icon:"🧹", prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:281,name:"Dishwasher Tablets (30pk)",    cat:"🧹 Household",    icon:"🍽️", prices:sp(6.50,[0,0.6,2.2,1.8,0.3])},
  {id:282,name:"Dishwasher Salt (1.5kg)",      cat:"🧹 Household",    icon:"🍽️", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:283,name:"Washing Up Gloves",            cat:"🧹 Household",    icon:"🧤", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:285,name:"Light Bulb LED (4pk)",         cat:"🧹 Household",    icon:"💡", prices:sp(4.50,[0,0.4,1.6,1.2,0.2])},
  {id:286,name:"Batteries AA (4pk)",           cat:"🧹 Household",    icon:"🔋", prices:sp(3.50,[1.7,0.32,1.2,0.95,0.16])},
  {id:287,name:"Batteries AAA (4pk)",          cat:"🧹 Household",    icon:"🔋", prices:sp(3.50,[1.7,0.32,1.2,0.95,0.16])},
  {id:288,name:"Candles (4pk)",                cat:"🧹 Household",    icon:"🕯️", prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},

  /* ── HEALTH & BEAUTY ──────────────────────────────────────────── */
  {id:289,name:"Shampoo (400ml)",              cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.50,[0.15,-1.40,0.95,0.75,0.12])},
  {id:290,name:"Conditioner (400ml)",          cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.50,[0.05,0.25,0.95,0.75,0.12])},
  {id:291,name:"2-in-1 Shampoo (400ml)",       cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:292,name:"Shower Gel (500ml)",           cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.00,[-0.05,1.75,0.8,0.6,0.1])},
  {id:293,name:"Body Wash (500ml)",            cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:294,name:"Bar Soap (4pk)",               cat:"💊 Health & Beauty",icon:"🧼",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:295,name:"Hand Soap (250ml)",            cat:"💊 Health & Beauty",icon:"🧼",prices:sp(1.40,[0.29,0.15,0.55,0.42,0.07])},
  {id:296,name:"Hand Sanitiser (250ml)",       cat:"💊 Health & Beauty",icon:"🧼",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:297,name:"Moisturiser Face (50ml)",      cat:"💊 Health & Beauty",icon:"🧴",prices:sp(3.80,[0,0.35,1.3,1,0.17])},
  {id:298,name:"Body Lotion (400ml)",          cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:299,name:"Toothpaste (75ml)",            cat:"💊 Health & Beauty",icon:"🪥",prices:sp(1.80,[0.09,3.20,0.7,0.55,0.09])},
  {id:300,name:"Toothpaste Electric Compat",   cat:"💊 Health & Beauty",icon:"🪥",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:301,name:"Toothbrush Manual (2pk)",      cat:"💊 Health & Beauty",icon:"🪥",prices:sp(2.20,[-1.25,0.22,0.85,0.65,0.11])},
  {id:302,name:"Dental Floss (50m)",           cat:"💊 Health & Beauty",icon:"🦷",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:303,name:"Mouthwash (500ml)",            cat:"💊 Health & Beauty",icon:"🦷",prices:sp(2.50,[0.65,0.83,0.95,0.75,0.12])},
  {id:304,name:"Deodorant Spray (150ml)",      cat:"💊 Health & Beauty",icon:"💨",prices:sp(2.20,[0,0.22,0.88,0.68,0.11])},
  {id:305,name:"Deodorant Roll-On (50ml)",     cat:"💊 Health & Beauty",icon:"💨",prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:306,name:"Razor Cartridges (4pk)",       cat:"💊 Health & Beauty",icon:"🪒",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:307,name:"Shaving Foam (200ml)",         cat:"💊 Health & Beauty",icon:"🪒",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:308,name:"Sun Cream SPF50 (200ml)",      cat:"💊 Health & Beauty",icon:"☀️",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:309,name:"Paracetamol (16pk)",           cat:"💊 Health & Beauty",icon:"💊",prices:sp(0.65,[0,0.08,0.3,0.22,0.04])},
  {id:310,name:"Ibuprofen (16pk)",             cat:"💊 Health & Beauty",icon:"💊",prices:sp(1.10,[-0.63,0.12,0.45,0.34,0.06])},
  {id:311,name:"Cold & Flu Tablets (16pk)",    cat:"💊 Health & Beauty",icon:"💊",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:312,name:"Vitamin C (60pk)",             cat:"💊 Health & Beauty",icon:"💊",prices:sp(4.50,[2.25,0.4,1.6,1.2,0.2])},
  {id:313,name:"Vitamin D (90pk)",             cat:"💊 Health & Beauty",icon:"💊",prices:sp(5.00,[0,0.45,1.7,1.32,0.23])},
  {id:314,name:"Plasters Assorted (40pk)",     cat:"💊 Health & Beauty",icon:"🩹",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:315,name:"Cotton Wool Pads (100pk)",     cat:"💊 Health & Beauty",icon:"🤍",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:316,name:"Lip Balm",                     cat:"💊 Health & Beauty",icon:"💄",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:317,name:"Feminine Pads (12pk)",         cat:"💊 Health & Beauty",icon:"🩸",prices:sp(2.80,[-0.41,0.28,1,0.8,0.14])},
  {id:318,name:"Tampons (16pk)",               cat:"💊 Health & Beauty",icon:"🩸",prices:sp(2.80,[1.15,0.28,1,0.8,0.14])},
  {id:319,name:"Condoms (12pk)",               cat:"💊 Health & Beauty",icon:"🩺",prices:sp(6.50,[0,0.6,2.2,1.8,0.3])},

  /* ── BABY & CHILD ─────────────────────────────────────────────── */
  {id:320,name:"Nappies Size 3 (40pk)",        cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(7.50,[-1.2,0.68,2.5,2,0.34])},
  {id:321,name:"Nappies Size 4 (36pk)",        cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(7.80,[-1.5,0.7,2.6,2.1,0.35])},
  {id:322,name:"Nappies Size 5 (34pk)",        cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(8.00,[-1.7,0.72,2.65,2.1,0.36])},
  {id:323,name:"Baby Wipes (72pk)",            cat:"🍼 Baby & Child",  icon:"🧻",prices:sp(1.80,[1.35,0.18,0.7,0.54,0.09])},
  {id:324,name:"Baby Wipes (3pk)",             cat:"🍼 Baby & Child",  icon:"🧻",prices:sp(4.50,[0,0.42,1.6,1.2,0.21])},
  {id:325,name:"Baby Shampoo (300ml)",         cat:"🍼 Baby & Child",  icon:"🧴",prices:sp(3.00,[-1.27,0.28,1.1,0.85,0.14])},
  {id:326,name:"Baby Lotion (400ml)",          cat:"🍼 Baby & Child",  icon:"🧴",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:327,name:"Baby Food Purée (4pk)",        cat:"🍼 Baby & Child",  icon:"🥣",prices:sp(3.20,[0,0.28,1.15,0.88,0.14])},
  {id:328,name:"Baby Rice Cereal (125g)",      cat:"🍼 Baby & Child",  icon:"🥣",prices:sp(2.80,[0,0.25,0.98,0.76,0.12])},
  {id:329,name:"Formula Milk Stage 1 (800g)",  cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(11.0,[0,1,3.5,2.8,0.5])},
  {id:330,name:"Formula Milk Stage 2 (800g)",  cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(10.5,[0,0.95,3.4,2.7,0.47])},
  {id:331,name:"Kids Multivitamins (30pk)",    cat:"🍼 Baby & Child",  icon:"💊",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:332,name:"Children's Paracetamol Liq.",  cat:"🍼 Baby & Child",  icon:"💊",prices:sp(3.80,[0,0.35,1.3,1,0.17])},

  /* ── PET CARE ─────────────────────────────────────────────────── */
  {id:333,name:"Dog Food Dry (2kg)",           cat:"🐾 Pet Care",      icon:"🐶",prices:sp(8.00,[-4.35,0.72,2.65,2.1,0.36])},
  {id:334,name:"Dog Food Wet Cans (6pk)",      cat:"🐾 Pet Care",      icon:"🐶",prices:sp(4.50,[0,0.42,1.6,1.2,0.21])},
  {id:335,name:"Dog Treats (150g)",            cat:"🐾 Pet Care",      icon:"🦴",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:336,name:"Cat Food Dry (2kg)",           cat:"🐾 Pet Care",      icon:"🐱",prices:sp(7.50,[-3.65,0.68,2.5,2,0.34])},
  {id:337,name:"Cat Food Wet Pouches (12pk)",  cat:"🐾 Pet Care",      icon:"🐱",prices:sp(5.50,[-1.9,0.5,1.8,1.4,0.25])},
  {id:338,name:"Cat Treats (60g)",             cat:"🐾 Pet Care",      icon:"🐱",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:339,name:"Cat Litter (10L)",             cat:"🐾 Pet Care",      icon:"🐱",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:340,name:"Pet Shampoo (250ml)",          cat:"🐾 Pet Care",      icon:"🛁",prices:sp(4.50,[0,0.42,1.6,1.2,0.21])},
  {id:341,name:"Flea Treatment Spot On (3pk)", cat:"🐾 Pet Care",      icon:"💊",prices:sp(12.0,[0,1.1,4.2,3.3,0.55])},
  {id:342,name:"Fish Food (100g)",             cat:"🐾 Pet Care",      icon:"🐠",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},

  /* ── FREE FROM ────────────────────────────────────────────────── */
  {id:343,name:"GF White Bread (400g)",        cat:"🌱 Free From",    icon:"🍞",prices:sp(2.90,[0,0.28,1,0.8,0.14])},
  {id:344,name:"GF Pasta (500g)",              cat:"🌱 Free From",    icon:"🍝",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:345,name:"GF Oats (500g)",               cat:"🌱 Free From",    icon:"🌾",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:346,name:"GF Crackers (150g)",           cat:"🌱 Free From",    icon:"🍘",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:347,name:"Dairy Free Cheese (200g)",     cat:"🌱 Free From",    icon:"🧀",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:348,name:"Vegan Butter (250g)",          cat:"🌱 Free From",    icon:"🧈",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:349,name:"Soya Yoghurt (400g)",          cat:"🌱 Free From",    icon:"🫙",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:350,name:"Vegan Mince (350g)",           cat:"🌱 Free From",    icon:"🥩",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:351,name:"Vegan Sausages (8pk)",         cat:"🌱 Free From",    icon:"🌭",prices:sp(3.20,[0,0.3,1.15,0.88,0.15])},
  {id:352,name:"Vegan Burgers (2pk)",          cat:"🌱 Free From",    icon:"🍔",prices:sp(3.00,[0,0.28,1.1,0.85,0.14])},
  {id:353,name:"Chickpea Dhal (400g jar)",     cat:"🌱 Free From",    icon:"🫘",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:354,name:"Oat Cream (250ml)",            cat:"🌱 Free From",    icon:"🍦",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},

  /* ── LOCAL JERSEY ─────────────────────────────────────────────── */
  {id:355,name:"Jersey Royal Potatoes (750g)", cat:"🥔 Local Jersey", icon:"🥔",prices:sp(1.50,[0,0.15,0.49,0.35,0.07])},
  {id:356,name:"Jersey Royals (1.5kg)",        cat:"🥔 Local Jersey", icon:"🥔",prices:sp(2.80,[0,0.25,0.8,0.6,0.12])},
  {id:357,name:"Jersey Royals (5kg)",          cat:"🥔 Local Jersey", icon:"🥔",prices:sp(7.50,[0,0.65,2,1.6,0.33])},
  {id:358,name:"Jersey Dairy Cream (300ml)",   cat:"🥔 Local Jersey", icon:"🍦",prices:sp(1.40,[0,0.15,0.4,0.3,0.07])},
  {id:359,name:"Jersey Dairy Butter (250g)",   cat:"🥔 Local Jersey", icon:"🧈",prices:sp(2.40,[0,0.2,0.6,0.45,0.1])},
  {id:360,name:"Jersey Dairy Milk (2L)",       cat:"🥔 Local Jersey", icon:"🥛",prices:sp(1.95,[0,0.18,0.55,0.4,0.09])},
  {id:361,name:"Jersey Dairy Ice Cream (1L)",  cat:"🥔 Local Jersey", icon:"🍨",prices:sp(4.20,[0,0.38,1.1,0.9,0.19])},
  {id:362,name:"Local Jersey Tomatoes (500g)", cat:"🥔 Local Jersey", icon:"🍅",prices:sp(1.80,[0,0.15,0.6,0.4,0.07])},
  {id:363,name:"Local Cucumber (each)",        cat:"🥔 Local Jersey", icon:"🥒",prices:sp(0.75,[0,0.08,0.28,0.22,0.04])},
  {id:364,name:"Jersey Crab (whole, ~600g)",   cat:"🥔 Local Jersey", icon:"🦀",prices:sp(7.50,[0,0.49,2,1.49,0.24])},
  {id:365,name:"Jersey Lobster (per 500g)",    cat:"🥔 Local Jersey", icon:"🦞",prices:sp(12.0,[0,0.8,2.5,2,0.4])},
  {id:366,name:"Local Mussels (1kg)",          cat:"🥔 Local Jersey", icon:"🦪",prices:sp(4.50,[0,0.38,1.2,0.95,0.19])},
  {id:367,name:"Jersey Black Butter (jar)",    cat:"🥔 Local Jersey", icon:"🍯",prices:sp(3.20,[0,0.3,0.9,0.7,0.15])},
  {id:368,name:"Local Apple Juice (1L)",       cat:"🥔 Local Jersey", icon:"🍏",prices:sp(2.80,[0,0.25,0.8,0.6,0.12])},
  {id:369,name:"Jersey Wonders (6pk)",         cat:"🥔 Local Jersey", icon:"🍩",prices:sp(2.00,[0,0.2,0.6,0.45,0.1])},
  {id:370,name:"Local Honey (250g)",           cat:"🥔 Local Jersey", icon:"🍯",prices:sp(5.50,[0,0.5,1.5,1.2,0.25])},
  {id:371,name:"Jersey Elderflower Cordial",   cat:"🥔 Local Jersey", icon:"🌸",prices:sp(4.80,[0,0.44,1.3,1,0.22])},
  {id:372,name:"Local Free Range Eggs (6pk)",  cat:"🥔 Local Jersey", icon:"🥚",prices:sp(2.20,[0,0.2,0.65,0.5,0.1])},
  {id:373,name:"Jersey Woollen Jumper",        cat:"🥔 Local Jersey", icon:"🧶",prices:sp(45.0,[0,4,12,10,2])},
  {id:374,name:"Halloumi (225g)",cat:"🥛 Dairy & Eggs",icon:"🧀",prices:sp(2.5,[0.35,-0.11,1.0,0.7,0.18])},
  {id:375,name:"Clotted Cream (113g)",cat:"🥛 Dairy & Eggs",icon:"🍦",prices:sp(2.0,[0.35,0.4,1.0,0.8,0.14])},
  {id:376,name:"Vine Tomatoes (220g)",cat:"🥦 Fruit & Veg",icon:"🍅",prices:sp(1.2,[0.25,0.95,1.3,1.0,0.08])},
  {id:377,name:"Avocados (2pk)",cat:"🥦 Fruit & Veg",icon:"🥑",prices:sp(1.5,[0.25,1.1,1.3,1.1,0.11])},
  {id:378,name:"Florette Salad (125g)",cat:"🥦 Fruit & Veg",icon:"🥗",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:379,name:"Fresh Coriander (30g)",cat:"🥦 Fruit & Veg",icon:"🌿",prices:sp(0.65,[0.1,-0.05,0.25,0.15,0.05])},
  {id:380,name:"Fresh Basil (pot)",cat:"🥦 Fruit & Veg",icon:"🌿",prices:sp(1.5,[0.15,0.1,0.5,0.3,0.11])},
  {id:381,name:"Cherries (500g)",cat:"🥦 Fruit & Veg",icon:"🍒",prices:sp(3.0,[0.35,0.5,1.2,0.8,0.21])},
  {id:382,name:"Pears (4pk)",cat:"🥦 Fruit & Veg",icon:"🍐",prices:sp(1.5,[0.15,0.05,0.5,0.3,0.11])},
  {id:383,name:"Strawberry Punnet (400g)",cat:"🥦 Fruit & Veg",icon:"🍓",prices:sp(2.5,[0.25,0.25,0.7,0.4,0.18])},
  {id:384,name:"Seedless Grapes (500g)",cat:"🥦 Fruit & Veg",icon:"🍇",prices:sp(2.2,[0.25,-0.01,0.6,0.35,0.15])},
  {id:385,name:"Burger Buns (4pk)",cat:"🍞 Bread & Bakery",icon:"🍔",prices:sp(1.2,[0.15,0.25,0.6,0.4,0.08])},
  {id:386,name:"Pancakes (6pk)",cat:"🍞 Bread & Bakery",icon:"🥞",prices:sp(1.2,[0.15,0.3,0.6,0.45,0.08])},
  {id:387,name:"Chicken Wings (750g)",cat:"🥩 Meat & Fish",icon:"🍗",prices:sp(3.0,[0.35,0.0,1.0,0.6,0.21])},
  {id:388,name:"Beef Diced (350g)",cat:"🥩 Meat & Fish",icon:"🥩",prices:sp(4.0,[0.45,0.25,1.2,0.7,0.28])},
  {id:389,name:"Beef Sirloin Steak (200g)",cat:"🥩 Meat & Fish",icon:"🥩",prices:sp(4.5,[0.5,-0.5,1.3,0.7,0.32])},
  {id:390,name:"Smoked Haddock (240g)",cat:"🥩 Meat & Fish",icon:"🐟",prices:sp(4.0,[0.45,1.0,1.5,1.0,0.28])},
  {id:391,name:"Cod Portions (240g)",cat:"🥩 Meat & Fish",icon:"🐟",prices:sp(4.0,[0.45,1.0,1.5,1.0,0.28])},
  {id:392,name:"King Prawns (225g)",cat:"🥩 Meat & Fish",icon:"🦐",prices:sp(4.0,[0.45,0.25,1.2,0.7,0.28])},
  {id:393,name:"Wafer Thin Ham (170g)",cat:"🥩 Meat & Fish",icon:"🥩",prices:sp(1.5,[0.15,-0.1,0.5,0.3,0.11])},
  {id:394,name:"Chorizo Ring (200g)",cat:"🥩 Meat & Fish",icon:"🌭",prices:sp(2.8,[0.3,0.2,0.8,0.45,0.2])},
  {id:395,name:"Frozen Berries (500g)",cat:"🧊 Frozen",icon:"🫐",prices:sp(2.5,[0.25,0.25,0.7,0.4,0.18])},
  {id:396,name:"Frozen Hash Browns (700g)",cat:"🧊 Frozen",icon:"🥔",prices:sp(2.0,[0.25,0.2,0.6,0.35,0.14])},
  {id:397,name:"Frozen Waffles (8pk)",cat:"🧊 Frozen",icon:"🧇",prices:sp(1.8,[0.2,-0.01,0.5,0.3,0.13])},
  {id:398,name:"Chopped Tomatoes (4pk)",cat:"🍝 Pantry",icon:"🍅",prices:sp(2.4,[0.25,-0.52,0.6,0.3,0.17])},
  {id:399,name:"Coconut Milk (400ml)",cat:"🍝 Pantry",icon:"🥥",prices:sp(1.2,[0.15,0.1,0.4,0.25,0.08])},
  {id:400,name:"Gravy Granules (200g)",cat:"🍝 Pantry",icon:"🍖",prices:sp(1.5,[0.15,0.1,0.4,0.25,0.11])},
  {id:401,name:"Custard (400g)",cat:"🍝 Pantry",icon:"🍮",prices:sp(1.3,[0.15,0.1,0.4,0.25,0.09])},
  {id:402,name:"Breadcrumbs (400g)",cat:"🍝 Pantry",icon:"🍞",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:403,name:"Lemon Juice (250ml)",cat:"🍝 Pantry",icon:"🍋",prices:sp(0.9,[0.1,0.05,0.3,0.2,0.06])},
  {id:404,name:"Tropicana Orange Juice (850ml)",cat:"🥤 Drinks",icon:"🍊",prices:sp(2.5,[0.25,0.0,0.7,0.4,0.18])},
  {id:405,name:"Ribena Squash (850ml)",cat:"🥤 Drinks",icon:"🫐",prices:sp(2.0,[0.25,0.1,0.6,0.44,0.14])},
  {id:406,name:"Coconut Water (1L)",cat:"🥤 Drinks",icon:"🥥",prices:sp(4.0,[0.45,0.0,1.0,0.5,0.28])},
  {id:407,name:"Carex Hand Wash (250ml)",cat:"💊 Health & Beauty",icon:"🧴",prices:sp(1.5,[0.19,0.0,0.4,0.25,0.11])},
  {id:408,name:"Radox Shower Gel (500ml)",cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.5,[0.25,0.5,0.7,0.4,0.18])},
  {id:409,name:"Dove Body Wash (400ml)",cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.8,[0.3,0.2,0.8,0.45,0.2])},
  {id:410,name:"Oral-B Toothbrush",cat:"💊 Health & Beauty",icon:"🪥",prices:sp(3.5,[0.35,0.25,1.0,0.6,0.25])},
  {id:411,name:"Listerine Mouthwash (500ml)",cat:"💊 Health & Beauty",icon:"🦷",prices:sp(3.0,[0.15,0.33,0.8,0.45,0.21])},
  {id:412,name:"Comfort Fabric Conditioner (1L)",cat:"🧹 Household",icon:"🧺",prices:sp(2.8,[0.3,0.19,0.8,0.45,0.2])},
  {id:413,name:"Flash All Purpose Spray (500ml)",cat:"🧹 Household",icon:"🧹",prices:sp(1.8,[0.2,0.1,0.5,0.3,0.13])},
  {id:414,name:"Domestos Bleach (750ml)",cat:"🧹 Household",icon:"🧴",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:415,name:"Sponge Scourers (5pk)",cat:"🧹 Household",icon:"🧽",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:416,name:"Bin Bags (20pk)",cat:"🧹 Household",icon:"🗑️",prices:sp(1.5,[0.15,0.1,0.4,0.25,0.11])},
  {id:417,name:"Foil Roll (30m)",cat:"🧹 Household",icon:"✨",prices:sp(1.8,[0.2,0.1,0.5,0.3,0.13])},
  {id:418,name:"Cling Film (30m)",cat:"🧹 Household",icon:"📦",prices:sp(1.5,[0.15,0.1,0.4,0.25,0.11])},
  {id:419,name:"Baby Wipes (64pk)",cat:"🍼 Baby & Child",icon:"🧻",prices:sp(2.0,[0.25,0.1,0.6,0.35,0.14])},
  {id:420,name:"Sudocrem (125g)",cat:"🍼 Baby & Child",icon:"🧴",prices:sp(3.5,[0.35,0.25,1.0,0.6,0.25])},
  {id:421,name:"Felix Cat Food 12pk",cat:"🐾 Pet Care",icon:"🐱",prices:sp(5.0,[0.55,0.25,1.5,0.85,0.35])},
  {id:422,name:"Pedigree Dog Food (1.5kg)",cat:"🐾 Pet Care",icon:"🐕",prices:sp(4.5,[0.5,0.25,1.3,0.7,0.32])},

  /* ── NEW — verified Co-op Millennium Park receipt 28 May 2026 ─── */
  {id:423,name:"Jersey Dairy Fresh Milk 1% (500ml)", cat:"🥔 Local Jersey", icon:"🥛",prices:sp(0.87,[0,-0.87,-0.87,-0.87,-0.87])},
  {id:430,name:"Jersey Dairy Fresh Milk 1% (1L)",    cat:"🥔 Local Jersey", icon:"🥛",prices:sp(1.65,[-1.65,-1.65,-1.65,0,-1.65])},

  /* ── NEW — verified Waitrose Red Houses receipt 31 May 2026 ─────────── */
  {id:431,name:"Lurpak Salted Spread",               cat:"🥛 Dairy & Eggs", icon:"🧈",prices:sp(3.50,[-3.50,-3.50,-3.50,0,-3.50])},
  {id:432,name:"Pepsi Cream Soda (8pk)",             cat:"🥤 Drinks",       icon:"🥤",prices:sp(5.12,[-5.12,-5.12,-5.12,0,-5.12])},
  {id:433,name:"Ribena Blackcurrant (ready to drink)",cat:"🥤 Drinks",      icon:"🫐",prices:sp(2.44,[-2.44,-2.44,-2.44,0,-2.44])},
  {id:434,name:"Waitrose Cauliflower Cheese",        cat:"🍝 Pantry",       icon:"🧀",prices:sp(4.06,[-4.06,-4.06,-4.06,0,-4.06])},
  {id:435,name:"Waitrose Beef Lasagne",              cat:"🍝 Pantry",       icon:"🍝",prices:sp(4.76,[-4.76,-4.76,-4.76,0,-4.76])},
  {id:436,name:"Waitrose Essential Cheese & Tomato Pizza",cat:"🍝 Pantry",  icon:"🍕",prices:sp(3.17,[-3.17,-3.17,-3.17,0,-3.17])},
  {id:437,name:"Waitrose Essential Potato Salad",    cat:"🥦 Fruit & Veg",  icon:"🥔",prices:sp(1.51,[-1.51,-1.51,-1.51,0,-1.51])},
  {id:438,name:"Waitrose Melton Mowbray Pork Pie",   cat:"🥩 Meat & Fish",  icon:"🥧",prices:sp(3.77,[-3.77,-3.77,-3.77,0,-3.77])},
  {id:439,name:"Peas, Cabbage & Broccoli (frozen)",  cat:"🥦 Fruit & Veg",  icon:"🥦",prices:sp(2.85,[-2.85,-2.85,-2.85,0,-2.85])},
  {id:440,name:"Waitrose Essential Mature Cheddar",  cat:"🥛 Dairy & Eggs", icon:"🧀",prices:sp(5.75,[-5.75,-5.75,-5.75,0,-5.75])},
  {id:441,name:"Walkers Cheese & Onion Crisps",      cat:"🥨 Snacks & Treats",       icon:"🥔",prices:sp(2.40,[-2.40,-2.40,-2.40,0,-2.40])},
  {id:442,name:"Walkers Ready Salted Crisps",        cat:"🥨 Snacks & Treats",       icon:"🥔",prices:sp(2.40,[-2.40,-2.40,-2.40,0,-2.40])},
  {id:443,name:"Alpro Mango Protein Yogurt",         cat:"🥛 Dairy & Eggs", icon:"🥭",prices:sp(1.86,[-1.86,-1.86,-1.86,0,-1.86])},
  {id:444,name:"Muller Corner Fruit Yogurt",         cat:"🥛 Dairy & Eggs", icon:"🍓",prices:sp(3.68,[-3.68,-3.68,-3.68,0,-3.68])},
  {id:445,name:"Waitrose Essential Mineral Water",   cat:"🥤 Drinks",       icon:"💧",prices:sp(1.69,[-1.69,-1.69,-1.69,0,-1.69])},
  {id:446,name:"Waitrose Chocolate Raisins",         cat:"🥨 Snacks & Treats",       icon:"🍫",prices:sp(2.09,[-2.09,-2.09,-2.09,0,-2.09])},
  {id:447,name:"Waitrose Wine Gums",                 cat:"🥨 Snacks & Treats",       icon:"🍬",prices:sp(1.34,[-1.34,-1.34,-1.34,0,-1.34])},
  {id:448,name:"Waitrose No.1 Sea Salt Crisps",      cat:"🥨 Snacks & Treats",       icon:"🧂",prices:sp(1.64,[-1.64,-1.64,-1.64,0,-1.64])},
  {id:424,name:"Jersey Dairy Fresh Milk 2.5% (500ml)",cat:"🥔 Local Jersey",icon:"🥛",prices:sp(0.87,[0,-0.87,-0.87,-0.87,-0.87])},
  {id:425,name:"Cornish Pasty",                    cat:"🍝 Pantry",       icon:"🥟",prices:sp(2.80,[0,0,0,0,0])},
  {id:426,name:"Chicken & Bacon Pasty",            cat:"🍝 Pantry",       icon:"🥟",prices:sp(2.80,[0,0,0,0,0])},
  {id:427,name:"Dauphinoise Potatoes (400g)",      cat:"🍝 Pantry",       icon:"🥔",prices:sp(3.65,[0,0,0,0,0])},
  {id:428,name:"Unsmoked Back Bacon (300g)",       cat:"🥩 Meat & Fish",  icon:"🥓",prices:sp(3.49,[0,0,0,0,0])},
  {id:429,name:"Jacobs Twiglets (6x23g)",          cat:"🥨 Snacks & Treats",       icon:"🥨",prices:sp(2.55,[-2.55,-2.55,-2.55,0,-2.55])},

  /* ── NEW — verified Waitrose St Helier receipt 30 May 2026 ─────────── */
  {id:449,name:"7UP Zero (4pk)",                     cat:"🥤 Drinks",       icon:"🥤",prices:sp(4.23,[-4.23,-4.23,-4.23,0,-4.23])},
  {id:450,name:"Waitrose Essential Double Cream",    cat:"🥛 Dairy & Eggs", icon:"🍦",prices:sp(1.51,[-1.51,-1.51,-1.51,0,-1.51])},
  {id:451,name:"Waitrose Essential Back Bacon (10)", cat:"🥩 Meat & Fish",  icon:"🥓",prices:sp(3.19,[-3.19,-3.19,-3.19,0,-3.19])},
  {id:452,name:"Waitrose Frozen Quarter Pounder",    cat:"🧊 Frozen",       icon:"🍔",prices:sp(4.60,[-4.60,-4.60,-4.60,0,-4.60])},
  {id:453,name:"McCain Southern Fries",              cat:"🧊 Frozen",       icon:"🍟",prices:sp(2.90,[-2.90,-2.90,-2.90,0,-2.90])},

  // ── Added 6 June 2026 from receipts ──
  {id:454,name:"Jersey Full Fat Milk (1ltr)",         cat:"🥛 Dairy & Eggs", icon:"🥛",prices:sp(1.64,[0,0,0,0,0])},
  {id:455,name:"Jersey Salted Butter (250g)",         cat:"🥛 Dairy & Eggs", icon:"🧈",prices:sp(1.90,[0,0,0,0,0])},
  {id:456,name:"Tortilla Wraps Large (8pk)",          cat:"🍞 Bread & Bakery",icon:"🌯",prices:sp(1.80,[0,0,0,0,0])},
  {id:457,name:"Large White Baps (4pk)",              cat:"🍞 Bread & Bakery",icon:"🍞",prices:sp(1.50,[0,0,0,0,0])},
  {id:458,name:"Smoked Streaky Bacon (250g)",         cat:"🥩 Meat & Fish",  icon:"🥓",prices:sp(3.49,[0,0,0,0,0])},
  {id:459,name:"Unsmoked Back Bacon (300g)",          cat:"🥩 Meat & Fish",  icon:"🥓",prices:sp(2.20,[0,0,0,0,0])},
  {id:460,name:"Iceberg Lettuce",                     cat:"🥦 Fruit & Veg",  icon:"🥬",prices:sp(1.60,[0,0,0,0,0])},
  {id:461,name:"Monster Energy Original (500ml)",     cat:"🥤 Drinks",       icon:"🟢",prices:sp(2.10,[0,0,0,0,0])},
  {id:462,name:"Chicken Dippers (20pk)",              cat:"🥩 Meat & Fish",  icon:"🍗",prices:sp(3.40,[0,0,0,0,0])},
  {id:463,name:"Garlic Chicken Kiev (2pk)",           cat:"🥩 Meat & Fish",  icon:"🍗",prices:sp(3.60,[0,0,0,0,0])},
  {id:464,name:"Beef Mince 20% Fat (500g)",           cat:"🥩 Meat & Fish",  icon:"🥩",prices:sp(4.35,[-4.35,-4.35,-4.35,0,-4.35])},
  {id:465,name:"Parmentier Potatoes (400g)",          cat:"🧊 Frozen",       icon:"🥔",prices:sp(2.79,[-2.79,-2.79,-2.79,0,-2.79])},
  {id:466,name:"Jacobs Cream Crackers (200g)",        cat:"🍪 Snacks",       icon:"🍘",prices:sp(1.55,[-1.55,-1.55,-1.55,0,-1.55])},
  {id:467,name:"Jam Doughnuts (5pk)",                 cat:"🍞 Bread & Bakery",icon:"🍩",prices:sp(1.57,[-1.57,-1.57,-1.57,0,-1.57])},
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const getBestPrice   = (p, disabled=new Set()) => { const vals=Object.entries(p.prices).filter(([k,v])=>!disabled.has(k)&&v>0).map(([,v])=>v); return vals.length?Math.min(...vals):0; };
const getWorstPrice  = (p, disabled=new Set()) => { const vals=Object.entries(p.prices).filter(([k,v])=>!disabled.has(k)&&v>0).map(([,v])=>v); return vals.length?Math.max(...vals):0; };
const getBestStoreId = (p, disabled=new Set()) => { const b=getBestPrice(p,disabled); return Object.entries(p.prices).find(([k,v])=>!disabled.has(k)&&v===b&&v>0)?.[0]; };
const getSortedPrices= (p, disabled=new Set()) => Object.entries(p.prices).filter(([k,v])=>!disabled.has(k)&&v>0).sort(([,a],[,b])=>a-b);

const ICON_OPTIONS = ["🛒","🥛","🥚","🧀","🧈","🍞","🥖","🥐","🍗","🥩","🥓","🐟","🍌","🍎","🥦","🥬","🫑","🥕","🍅","🥑","🍊","💧","☕","🍷","🍺","🍝","🍚","🫒","🧴","🧻","🪥","💊","🧹","🥔","🦀","🍦","🍯","🍕","🍟","🍨","🥨","🍫","🥜","🫧","🧼","💨","🍶","🌾","🫘","🌭","🥤","🍸","🧅","🧄","🥒","🍋","🍄","🍓","🫐","🍾","🥂","🍩","🦞","🍏","🍇","🌻","🐶","🐱","🦴","🍼","🩸","💊","🩹","🌸","🏷️","⚡","🥂","🥃","🌮","🥙","🍬","🍿","🥝","🍍","🥭","🌶️","🍠","🍈","🍆","🎃","🌽","🧇","🥞","🥯","🍳"];

/* ═══════════════════════════════════════════════════════════════════════════
   TOOLTIP — shows full text on hover when content is truncated
═══════════════════════════════════════════════════════════════════════════ */
function Tooltip({ text, children }) {
  const [visible,  setVisible]  = useState(false);
  const [pos,      setPos]      = useState({ x:0, y:0, above:false });
  const [isTrunc,  setIsTrunc]  = useState(false);
  const elRef = useRef(null);
  const tipRef= useRef(null);

  const checkTrunc = () => {
    const el = elRef.current;
    if (el) setIsTrunc(el.scrollWidth > el.clientWidth + 1);
  };

  const show = (e) => {
    checkTrunc();
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tipW = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < 70;
    // centre the tip over the element, clamp to viewport
    let x = rect.left + rect.width / 2 - tipW / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - tipW - 8));
    const y = above ? rect.top - 8 : rect.bottom + 6;
    setPos({ x, y, above });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  // also recalc on resize
  useEffect(() => {
    window.addEventListener("resize", checkTrunc);
    checkTrunc();
    return () => window.removeEventListener("resize", checkTrunc);
  }, [text]);

  return (
    <>
      <div
        ref={elRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onTouchStart={show}
        onTouchEnd={()=>setTimeout(hide,1800)}
        style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor: isTrunc ? "help" : "default" }}
      >
        {children}
      </div>

      {/* Portal-style tooltip rendered at fixed position */}
      {visible && isTrunc && (
        <div
          ref={tipRef}
          style={{
            position:"fixed",
            left: pos.x,
            top: pos.above ? "auto" : pos.y,
            bottom: pos.above ? window.innerHeight - pos.y : "auto",
            width: 220,
            background:"#1e293b",
            border:"1px solid rgba(34,197,94,.35)",
            borderRadius:9,
            padding:"8px 12px",
            fontSize:12,
            fontWeight:600,
            color:"#f0f4f8",
            lineHeight:1.4,
            zIndex:9999,
            boxShadow:"0 8px 32px rgba(0,0,0,.6)",
            pointerEvents:"none",
            wordBreak:"break-word",
            whiteSpace:"normal",
          }}
        >
          {/* little arrow */}
          <div style={{
            position:"absolute",
            left: "50%", transform:"translateX(-50%)",
            ...(pos.above
              ? { bottom:-5, borderTop:"5px solid #1e293b",    borderLeft:"5px solid transparent", borderRight:"5px solid transparent" }
              : { top:-5,    borderBottom:"5px solid #1e293b", borderLeft:"5px solid transparent", borderRight:"5px solid transparent" }),
            width:0, height:0,
          }}/>
          {text}
        </div>
      )}
    </>
  );
}


function ProductCard({ product, onAddToBasket, pinnedStore, isFavourite, onToggleFavourite, disabledStores=new Set() }) {
  const [open, setOpen]             = useState(false);
  // manualOverride tracks if the user explicitly picked a store via the dropdown
  const [manualOverride, setManualOverride] = useState(null);

  const sorted     = getSortedPrices(product, disabledStores);
  const bestPrice  = sorted[0]?.[1] ?? 0;
  const bestId     = sorted[0]?.[0];

  // Priority: manual override > global pin > cheapest
  const effectiveStoreId = manualOverride && !disabledStores.has(manualOverride)
    ? manualOverride
    : pinnedStore && product.prices[pinnedStore] !== undefined && !disabledStores.has(pinnedStore)
      ? pinnedStore
      : bestId;

  const chosenStoreId = effectiveStoreId;
  const chosenPrice= product.prices[chosenStoreId] ?? 0;
  const chosenStore= STORES.find(s=>s.id===chosenStoreId);
  const saving     = getWorstPrice(product,disabledStores)-bestPrice;
  const overBest   = chosenPrice-bestPrice;
  const isOnBest   = chosenStoreId===bestId;

  // When global pin changes, clear any manual override
  const prevPin = useRef(pinnedStore);
  useEffect(()=>{
    if(prevPin.current !== pinnedStore) { setManualOverride(null); prevPin.current = pinnedStore; }
  },[pinnedStore]);

  return (
    <div style={{ background:"linear-gradient(180deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,.03) 100%)", border:`1px solid ${product.custom?"rgba(34,197,94,.25)":"rgba(255,255,255,.1)"}`, borderRadius:16, overflow:"visible", transition:"box-shadow .15s", boxShadow:"0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.08)" }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.08)";}}>

      {/* main row */}
      <div style={{ padding:"12px 14px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
          <span style={{ fontSize:22, flexShrink:0, filter:"drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>{product.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <Tooltip text={product.name}>
              <div style={{ fontSize:12.5, fontWeight:700, color:"#f0f4f8", lineHeight:1.3 }}>{product.name}</div>
            </Tooltip>
            <div style={{ fontSize:9.5, color:"#475569", marginTop:1 }}>{product.cat.replace(/^[^\s]+\s/,"")}{product.custom?" · custom":""}</div>
          </div>
          {/* heart / favourite button */}
          <button
            onClick={e=>{ e.stopPropagation(); onToggleFavourite(product.id); }}
            title={isFavourite?"Remove from favourites":"Add to favourites"}
            style={{ flexShrink:0, background:"none", border:"none", cursor:"pointer", fontSize:18, lineHeight:1, padding:"2px 4px", transition:"transform .15s", color:isFavourite?"#f43f5e":"rgba(255,255,255,.2)" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.25)"; e.currentTarget.style.color=isFavourite?"#fb7185":"rgba(244,63,94,.7)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.color=isFavourite?"#f43f5e":"rgba(255,255,255,.2)"; }}
          >{isFavourite?"♥":"♡"}</button>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontSize:19, fontWeight:800, color:isOnBest?"#4ade80":"#fbbf24", lineHeight:1, textShadow:isOnBest?"0 0 10px rgba(74,222,128,0.4)":"0 0 10px rgba(251,191,36,0.4)" }}>£{chosenPrice.toFixed(2)}</div>
            {!isOnBest && <div style={{ fontSize:8.5, color:"#f87171", marginTop:1 }}>+£{overBest.toFixed(2)} vs best</div>}
            {isOnBest && saving>0.09 && <div style={{ fontSize:8.5, color:"#86efac", marginTop:1 }}>saves £{saving.toFixed(2)}</div>}
          </div>
        </div>

        {/* store pill + add */}
        <div style={{ display:"flex", alignItems:"center", gap:8, paddingBottom:11 }}>
          {(() => {
            const sc = chosenStore?.color || "#22c55e";
            const r=parseInt(sc.slice(1,3),16), g=parseInt(sc.slice(3,5),16), b=parseInt(sc.slice(5,7),16);
            return (
              <button onClick={()=>setOpen(o=>!o)} style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"space-between",
                background: `linear-gradient(180deg,rgba(${r},${g},${b},0.18) 0%,rgba(${r},${g},${b},0.1) 100%)`,
                border: `1px solid rgba(${r},${g},${b},0.4)`,
                borderRadius:9, padding:"7px 10px", cursor:"pointer", gap:5,
                boxShadow:`inset 0 1px 0 rgba(255,255,255,.1)`,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:13 }}>{chosenStore?.emoji}</span>
                  <span style={{ fontSize:10.5, fontWeight:700, color:`rgb(${Math.min(255,r+80)},${Math.min(255,g+80)},${Math.min(255,b+80)})` }}>{chosenStore?.name}</span>
                  {isOnBest && <span style={{ fontSize:8, background:`rgba(${r},${g},${b},0.3)`, color:sc, borderRadius:4, padding:"1px 5px", fontWeight:700, border:`1px solid rgba(${r},${g},${b},0.4)` }}>BEST</span>}
                </div>
                <span style={{ fontSize:16, color:sc, display:"inline-block", transition:"transform .2s", transform:open?"rotate(180deg)":"none", lineHeight:1 }}>▾</span>
              </button>
            );
          })()}
          <button onClick={()=>onAddToBasket(product.id,chosenStoreId)} style={{
            flexShrink:0, position:"relative", overflow:"hidden",
            background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",
            border:"none", borderRadius:9, padding:"7px 14px",
            color:"#052e16", cursor:"pointer", fontSize:12.5, fontWeight:700, whiteSpace:"nowrap",
            boxShadow:"0 2px 8px rgba(34,197,94,.5), inset 0 1px 0 rgba(255,255,255,.3)",
          }}>
            <span style={{ position:"absolute", top:0, left:0, right:0, height:"52%", background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)", borderRadius:"9px 9px 0 0", pointerEvents:"none" }} />
            + Add
          </button>
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", background:"rgba(0,0,0,.35)", borderRadius:"0 0 16px 16px", overflow:"hidden" }}>
          {sorted.map(([sid,price],idx)=>{
            const store    = STORES.find(s=>s.id===sid);
            const isBest   = idx===0;
            const isSel    = sid===chosenStoreId;
            const diff     = price-bestPrice;
            const pct      = Math.round((diff/bestPrice)*100);
            const sc       = store?.color||"#22c55e";
            return (
              <button key={sid} onClick={()=>{setManualOverride(sid);setOpen(false);}} style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"9px 14px", border:"none", cursor:"pointer", textAlign:"left",
                background: isSel ? `linear-gradient(90deg,${sc}22 0%,${sc}08 100%)` : idx%2===0?"rgba(255,255,255,.02)":"rgba(0,0,0,.1)",
                borderLeft: `3px solid ${isSel?sc:"transparent"}`,
                transition:"background .1s",
                boxShadow: isSel ? `inset 0 1px 0 rgba(255,255,255,.05)` : "none",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:15 }}>{store?.emoji}</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:isSel?sc:"#e2e8f0", display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                      {store?.name}
                      {isBest && <span style={{ fontSize:8, background:`${sc}33`, color:sc, borderRadius:4, padding:"1px 5px", fontWeight:700, border:`1px solid ${sc}55` }}>CHEAPEST</span>}
                      {isSel && !isBest && <span style={{ fontSize:8, background:"rgba(251,191,36,.15)", color:"#fcd34d", borderRadius:4, padding:"1px 5px" }}>SELECTED</span>}
                    </div>
                    <div style={{ fontSize:8.5, color:"#475569", marginTop:1 }}>{store?.note}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:isBest?sc:isSel?"#fcd34d":"#cbd5e1" }}>£{price.toFixed(2)}</div>
                  {pct>0 ? <div style={{ fontSize:8.5, color:"#f87171" }}>+{pct}% · +£{diff.toFixed(2)}</div>
                         : <div style={{ fontSize:8.5, color:sc }}>best price</div>}
                </div>
              </button>
            );
          })}
          <div style={{ padding:"7px 14px", fontSize:9, color:"#334155", fontStyle:"italic", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>Tap a store to override for this item</span>
            {manualOverride && <button onClick={()=>setManualOverride(null)} style={{ background:"rgba(251,191,36,.15)",border:"none",color:"#fcd34d",fontSize:8.5,fontWeight:700,borderRadius:4,padding:"2px 7px",cursor:"pointer" }}>Reset ↺</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Formspree form ID ───────────────────────────────────────────────────────
const FORMSPREE_ID = "mvzyrgqj";

/* ═══════════════════════════════════════════════════════════════════════════
   JUNE COMPETITION — update LEADERBOARD entries below each week
   Format: { name: "First L", count: 12 }   ← first name + last initial only
   Set COMP_WINNER to "" while competition is live, or "First L" when decided.
   Competition auto-expires at midnight 30 June 2026 — no manual change needed.
═══════════════════════════════════════════════════════════════════════════ */
const COMP_ACTIVE = true;
const COMP_WINNER = ""; // e.g. "Sarah M" — leave blank while competition is live

/* ─── MAINTENANCE MODE — set to true to show "back shortly" screen ─── */
const MAINTENANCE = false;
const LEADERBOARD = [
  // ── TOP 5 — update these entries with real submissions ──────────────────
  { name: "Carmen1971", store: "CI Co-op", count: 14, date: "06 Jun" },
  // { name: "Sarah M",  count: 24 },
  // { name: "James O",  count: 18 },
  // { name: "Claire B", count: 15 },
  // { name: "Tom H",    count: 9  },
  // ── Remove the // at the start of each line above to activate ────────────
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════════ */
export default function JerseyGroceryApp() {

  const [allProducts]                        = useState(BASE_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [basket, setBasket]                 = useState({});
  const [pinnedStore, setPinnedStore]       = useState(null);
  const [sortBy, setSortBy]                 = useState("bestPrice");
  const [view, setView]                     = useState("shop");
  const [showEnquiry,    setShowEnquiry]    = useState(false);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [showHelp,       setShowHelp]       = useState(false);
  const [showReport,     setShowReport]     = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [disabledStores, setDisabledStores] = useState(new Set());
  const [showCompetition,  setShowCompetition]  = useState(false);
  const [showSubmitPrice,  setShowSubmitPrice]  = useState(false);


  const toggleStore = (storeId) => {
    setDisabledStores(prev => {
      const next = new Set(prev);
      if (next.has(storeId)) { next.delete(storeId); } else { next.add(storeId); }
      if (next.has(storeId) && pinnedStore === storeId) setPinnedStore(null);
      return next;
    });
  };

  const activeStores = STORES.filter(s => !disabledStores.has(s.id));

  // Show welcome screen every time the app loads
  const [showWelcome, setShowWelcome] = useState(true);

  const dismissWelcome = () => {
    setShowWelcome(false);
  };
  const [newItem, setNewItem]               = useState({ name:"", cat:"➕ Custom", icon:"🛒", prices:{coop:"",morrisons:"",ms:"",waitrose:"",iceland:""} });
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [addError, setAddError]             = useState("");
  const [toast, setToast] = useState(null);
  const [favourites, setFavourites]         = useState(new Set());
  const [favBasket,  setFavBasket]          = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(null), 3000);
  };

  /* persist basket + favourites to localStorage (survives app restart) */
  useEffect(()=>{
    try {
      const b = localStorage.getItem("jb_basket");      if(b) setBasket(JSON.parse(b));
      const f = localStorage.getItem("jb_favourites");  if(f) setFavourites(new Set(JSON.parse(f)));
      const fb= localStorage.getItem("jb_fav_basket");  if(fb) setFavBasket(JSON.parse(fb));
    } catch{}
  },[]);
  useEffect(()=>{ try{localStorage.setItem("jb_basket",JSON.stringify(basket));}catch{} },[basket]);
  useEffect(()=>{ try{localStorage.setItem("jb_favourites",JSON.stringify([...favourites]));}catch{} },[favourites]);
  useEffect(()=>{ try{localStorage.setItem("jb_fav_basket",JSON.stringify(favBasket));}catch{} },[favBasket]);

  const toggleFavourite = useCallback((pid)=>{
    setFavourites(prev=>{
      const next = new Set(prev);
      if(next.has(pid)){ next.delete(pid); } else { next.add(pid); }
      return next;
    });
  },[]);

  const addToFavBasket    = useCallback((pid,sid)=>setFavBasket(p=>{const k=`${pid}-${sid}`;return{...p,[k]:(p[k]||0)+1};}), []);
  const removeFromFavBasket   = useCallback(key=>setFavBasket(p=>{const n={...p};n[key]>1?n[key]--:delete n[key];return n;}), []);
  const deleteFromFavBasket   = useCallback(key=>setFavBasket(p=>{const n={...p};delete n[key];return n;}), []);

  const filteredProducts = useMemo(()=>{
    let list = allProducts;
    if(activeCategory!=="All") list = list.filter(p=>p.cat===activeCategory);
    if(searchQuery) list = list.filter(p=>p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if(pinnedStore) list = list.filter(p=>p.prices[pinnedStore]!==undefined);
    if(sortBy==="bestPrice") return [...list].sort((a,b)=>getBestPrice(a,disabledStores)-getBestPrice(b,disabledStores));
    if(sortBy==="savings")   return [...list].sort((a,b)=>(getWorstPrice(b,disabledStores)-getBestPrice(b,disabledStores))-(getWorstPrice(a,disabledStores)-getBestPrice(a,disabledStores)));
    if(sortBy==="az")        return [...list].sort((a,b)=>a.name.localeCompare(b.name));
    if(sortBy==="cat")       return [...list].sort((a,b)=>a.cat.localeCompare(b.cat)||a.name.localeCompare(b.name));
    return list;
  },[allProducts,activeCategory,searchQuery,pinnedStore,sortBy,disabledStores]);

  const addToBasket    = useCallback((pid,sid)=>setBasket(p=>{const k=`${pid}-${sid}`;return{...p,[k]:(p[k]||0)+1};}), []);
  const removeFromBasket   = useCallback(key=>setBasket(p=>{const n={...p};n[key]>1?n[key]--:delete n[key];return n;}), []);
  const deleteFromBasket   = useCallback(key=>setBasket(p=>{const n={...p};delete n[key];return n;}), []);

  const basketItems = useMemo(()=>Object.entries(basket).map(([key,qty])=>{
    const[pId,sId]=key.split("-");
    const product=allProducts.find(p=>p.id===parseInt(pId));
    if(!product)return null;
    return{key,product,store:STORES.find(s=>s.id===sId),qty,price:product.prices[sId]};
  }).filter(Boolean),[basket,allProducts]);

  const basketTotal    = basketItems.reduce((s,i)=>s+i.price*i.qty,0);
  const basketCount    = Object.values(basket).reduce((a,b)=>a+b,0);
  const favCount       = favourites.size;
  const favBasketCount = Object.values(favBasket).reduce((a,b)=>a+b,0);
  const optimalTotal   = basketItems.reduce((s,i)=>s+getBestPrice(i.product,disabledStores)*i.qty,0);
  const potentialSave  = basketTotal-optimalTotal;

  const storeBasketTotals = useMemo(()=>STORES.map(store=>({
    store, total:basketItems.reduce((s,item)=>s+(item.product.prices[store.id]??0)*item.qty,0)
  })).sort((a,b)=>a.total-b.total),[basketItems]);

  const catCounts = useMemo(()=>{
    const m={All:allProducts.length};
    allProducts.forEach(p=>{m[p.cat]=(m[p.cat]||0)+1;});
    return m;
  },[allProducts]);

  const liveVals   = STORES.map(s=>parseFloat(newItem.prices[s.id])).filter(v=>!isNaN(v)&&v>0);
  const liveMin    = liveVals.length?Math.min(...liveVals):null;

  const [addItemStatus, setAddItemStatus] = useState("idle"); // idle | sending | sent | error

  const submitNewItem = async ()=>{
    if(!newItem.name.trim()){setAddError("Please enter a product name.");return;}
    const filled=Object.entries(newItem.prices).filter(([,v])=>v!=="");
    if(!filled.length){setAddError("Enter at least one store price.");return;}
    for(const[,v]of filled){if(isNaN(parseFloat(v))||parseFloat(v)<0){setAddError("Prices must be positive numbers.");return;}}

    setAddItemStatus("sending");
    const priceLines = filled.map(([k,v])=>`${STORES.find(s=>s.id===k)?.name}: £${parseFloat(v).toFixed(2)}`).join("\n");

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({
          _subject:`New Product Submission — JerseyBasket.je`,
          product_name: newItem.name.trim(),
          category: newItem.cat,
          prices: priceLines,
          message:`A customer has submitted a new product for review.\n\nProduct: ${newItem.name.trim()}\nCategory: ${newItem.cat}\n\nPrices submitted:\n${priceLines}\n\nPlease verify in-store and add to the app if correct.`,
        })
      });
      if(res.ok){ setAddItemStatus("sent"); setAddError(""); }
      else { setAddItemStatus("error"); }
    } catch { setAddItemStatus("error"); }
  };

  /* ── RENDER ─────────────────────────────────────────────────────── */
  if (MAINTENANCE) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#050d1a 0%,#0b1c35 55%,#061220 100%)", fontFamily:"'Georgia',serif", color:"#f0f4f8", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🛠️</div>
        <div style={{ fontSize:24, fontWeight:700, color:"#22c55e", marginBottom:10 }}>Back Shortly!</div>
        <div style={{ fontSize:15, color:"#94a3b8", lineHeight:1.7, marginBottom:24 }}>
          JerseyBasket is currently being updated with new prices and features.
          <br/>We'll be back in just a few minutes. 🇯🇪
        </div>
        <div style={{ fontSize:12, color:"#475569" }}>
          Questions? Email <a href="mailto:hello@jerseybasket.je" style={{ color:"#22c55e" }}>hello@jerseybasket.je</a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#050d1a 0%,#0b1c35 55%,#061220 100%)", fontFamily:"'Georgia',serif", color:"#f0f4f8" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0, background:"radial-gradient(ellipse 80% 60% at 15% 5%,rgba(0,180,100,.05) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 85% 95%,rgba(0,100,220,.06) 0%,transparent 60%)" }} />

      {/* ══ HEADER ══ */}
      <header style={{ position:"sticky",top:0,zIndex:100, background:"rgba(5,13,26,.96)",backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.07)",padding:"0 12px",paddingTop:"env(safe-area-inset-top,0px)" }}>
        <div style={{ maxWidth:1040,margin:"0 auto" }}>
          {/* ── ROW 1: logo + icon buttons ── */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:10,paddingBottom:7,gap:6 }}>
            <div style={{ display:"flex",alignItems:"center",gap:7,minWidth:0,flexShrink:1 }}>
              <span style={{ fontSize:20,flexShrink:0,filter:"drop-shadow(0 2px 4px rgba(34,197,94,0.4))" }}>🛍️</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:700,letterSpacing:"-0.5px",lineHeight:1.1,whiteSpace:"nowrap" }}>
                  Jersey<span style={{ color:"#4ade80",textShadow:"0 0 12px rgba(74,222,128,0.6)" }}>Basket</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:3 }}>
                  <span style={{ fontSize:8.5,color:"#475569",letterSpacing:".8px" }}>CHANNEL ISLANDS</span>
                  <span style={{ width:3,height:3,borderRadius:"50%",background:"#334155",display:"inline-block",flexShrink:0 }}/>
                  <span style={{ fontSize:10,fontWeight:700,background:"linear-gradient(180deg,#4ade80 0%,#16a34a 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>{allProducts.length} products</span>
                  <span style={{ fontSize:8.5,background:"linear-gradient(180deg,#60a5fa 0%,#1d4ed8 100%)",color:"#fff",borderRadius:5,padding:"1px 5px",fontWeight:700,boxShadow:"0 1px 4px rgba(37,99,235,0.5)",flexShrink:0 }}>LIVE</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex",gap:4,alignItems:"center",flexShrink:0 }}>
              {/* Share */}
              <button onClick={()=>{
                const shareData = { title:"JerseyBasket.je", text:"Compare grocery prices across all Jersey supermarkets! 🇯🇪", url:"https://jerseybasket.je" };
                if (navigator.share) { navigator.share(shareData).catch(()=>{}); }
                else { navigator.clipboard.writeText("https://jerseybasket.je").then(()=>showToast("🔗 Link copied!")); }
              }} title="Share JerseyBasket"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                🔗
              </button>
              {/* Report */}
              <button onClick={()=>setShowReport(true)} title="Report a problem"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                🚩
              </button>
              {/* Help */}
              <button onClick={()=>setShowHelp(true)} title="Help"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                ?
              </button>
              {/* Settings */}
              <button onClick={()=>setShowSettings(true)} title="Settings"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                ⚙️
              </button>
            </div>
          </div>
          {/* ── ROW 2: nav tabs + add button ── */}
          <div style={{ display:"flex",gap:3,paddingBottom:9,alignItems:"center" }}>
            {[["shop","🛒 Shop"],["basket","🧺 Basket"],["favourites",`♥ Saved${favCount>0?" ("+favCount+")":""}`],["compare","📊 Stores"]].map(([v,lbl])=>{
              const isActive = view===v;
              const isFav = v==="favourites";
              return (
                <button key={v} onClick={()=>setView(v)} style={{
                  WebkitAppearance:"none",appearance:"none",
                  background: isActive ? (isFav?"linear-gradient(180deg,#fb7185 0%,#be123c 100%)":"linear-gradient(180deg,#4ade80 0%,#15803d 100%)") : "linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",
                  border: isActive ? (isFav?"1px solid rgba(251,113,133,.5)":"1px solid rgba(74,222,128,.5)") : "1px solid rgba(125,211,252,0.15)",
                  color: isActive ? (isFav?"#fff":"#052e16") : "#7dd3fc",
                  borderRadius:22, padding:"6px 11px", cursor:"pointer", fontSize:11, fontWeight:700,
                  flexShrink:0, position:"relative", overflow:"hidden",
                  boxShadow: isActive ? (isFav?"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)":"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.25)") : "0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.07)",
                }}>
                  <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"22px 22px 0 0",pointerEvents:"none" }}/>
                  {lbl}
                </button>
              );
            })}
            <button onClick={()=>setShowAddModal(true)} style={{
              WebkitAppearance:"none",appearance:"none",marginLeft:"auto",
              background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",
              border:"none",borderRadius:9,padding:"6px 12px",
              color:"#052e16",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,
              boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",
              position:"relative",overflow:"hidden",
            }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
              + Add
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1040,margin:"0 auto",padding:"0 16px calc(132px + 60px)",position:"relative",zIndex:1 }}>

        {/* ══════════════════════════ SHOP ══════════════════════════ */}
        {view==="shop" && (
          <div>
            {/* ── PRICE DISCLAIMER BANNER ── */}
            <div style={{ margin:"14px 0 10px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.28)",borderRadius:11,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start" }}>
              <span style={{ fontSize:18,flexShrink:0,marginTop:1 }}>⚠️</span>
              <div style={{ fontSize:11,color:"#fcd34d",lineHeight:1.6 }}>
                <strong>Prices are currently approximate.</strong> We are actively verifying all prices in-store across all 5 Jersey supermarkets. Some prices may differ from what you see on the shelf.
                {" "}<span style={{ color:"#f59e0b" }}>Always verify in-store before you shop.</span>
              </div>
            </div>

            {/* hint */}
            <div style={{ margin:"14px 0 12px",background:"rgba(59,130,246,.09)",border:"1px solid rgba(59,130,246,.22)",borderRadius:11,padding:"9px 13px",display:"flex",gap:9,alignItems:"center" }}>
              <span style={{ fontSize:16,flexShrink:0 }}>💡</span>
              <div style={{ fontSize:11,color:"#93c5fd",lineHeight:1.5 }}>
                <strong>Each item shows the cheapest price.</strong> Tap the store pill to switch to a different store — then hit <strong>+ Add</strong> to add to basket.
              </div>
            </div>

            {/* search + sort */}
            <div style={{ display:"flex",gap:9,marginBottom:11,flexWrap:"wrap" }}>
              <div style={{ flex:1,minWidth:160,position:"relative" }}>
                <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none" }}>🔍</span>
                <input
                  value={searchQuery}
                  onChange={e=>setSearchQuery(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Escape") setSearchQuery(""); }}
                  placeholder={`Search ${allProducts.length} products…`}
                  inputMode="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  style={{ width:"100%",padding:"8px 32px 8px 34px",background:"rgba(255,255,255,.06)",border:`1px solid ${searchQuery?"rgba(34,197,94,.4)":"rgba(255,255,255,.10)"}`,borderRadius:9,color:"#fff",fontSize:16,outline:"none",boxSizing:"border-box",transition:"border-color .2s",WebkitAppearance:"none" }}
                />
                {searchQuery && (
                  <button
                    onClick={()=>setSearchQuery("")}
                    title="Clear search"
                    style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.12)",border:"none",borderRadius:"50%",width:18,height:18,color:"#94a3b8",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,fontWeight:700,transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,.25)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.12)"}
                  >✕</button>
                )}
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"8px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.10)",borderRadius:9,color:"#fff",fontSize:11,cursor:"pointer",outline:"none" }}>
                <option value="bestPrice">Sort: Cheapest First</option>
                <option value="savings">Sort: Biggest Saving</option>
                <option value="az">Sort: A–Z</option>
                <option value="cat">Sort: Category</option>
              </select>
            </div>

            {/* store filter */}
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",paddingBottom:7,marginBottom:4 }}>
              <Chip active={!pinnedStore} onClick={()=>setPinnedStore(null)} color="#3b82f6">🏷️ Best Price</Chip>
              {activeStores.map(s=>(
                <Chip key={s.id} active={pinnedStore===s.id} onClick={()=>setPinnedStore(pinnedStore===s.id?null:s.id)} color={s.color}>{s.emoji} {s.short}</Chip>
              ))}
              {disabledStores.size>0&&<button onClick={()=>setShowSettings(true)} style={{ whiteSpace:"nowrap",padding:"6px 13px",borderRadius:22,fontSize:11,fontWeight:700,cursor:"pointer",background:"linear-gradient(180deg,rgba(251,191,36,.2) 0%,rgba(180,83,9,.15) 100%)",border:"1px solid rgba(251,191,36,.4)",color:"#fcd34d",flexShrink:0 }}>⚙️ {disabledStores.size} store{disabledStores.size>1?"s":""} hidden</button>}
            </div>

            {/* category pills */}
            <div style={{ display:"flex",gap:5,overflowX:"auto",paddingBottom:9,marginBottom:7 }}>
              {CATS.filter(c=>catCounts[c]).map(cat=>(
                <button key={cat} onClick={()=>setActiveCategory(cat)} style={{ whiteSpace:"nowrap",padding:"5px 13px",borderRadius:20,fontSize:10.5,fontWeight:600,border:"none",cursor:"pointer", background:activeCategory===cat?"linear-gradient(135deg,#16a34a,#15803d)":"rgba(255,255,255,.05)", color:activeCategory===cat?"#fff":"#94a3b8" }}>
                  {cat} <span style={{ opacity:.5,fontSize:8.5 }}>({catCounts[cat]})</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize:10.5,color:"#475569",marginBottom:10 }}>
              {filteredProducts.length} product{filteredProducts.length!==1?"s":""}
              {searchQuery&&` · "${searchQuery}"`}
              {activeCategory!=="All"&&` · ${activeCategory.replace(/^[^\s]+\s/,"")}`}
            </div>

            {/* active store banner */}
            {pinnedStore && (() => {
              const s = STORES.find(x=>x.id===pinnedStore);
              return (
                <div style={{ marginBottom:10, background:`${s.color}18`, border:`1px solid ${s.color}45`, borderRadius:11, padding:"9px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{s.emoji}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#f0f4f8" }}>Showing <span style={{ color:s.color }}>{s.name}</span> prices for all items</div>
                      <div style={{ fontSize:10, color:"#64748b", marginTop:1 }}>Tap any store pill on a card to override that item individually</div>
                    </div>
                  </div>
                  <button onClick={()=>setPinnedStore(null)} style={{ background:"rgba(255,255,255,.1)",border:"none",color:"#94a3b8",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>✕ Clear</button>
                </div>
              );
            })()}

            {/* ── JUNE COMPETITION BANNER ── */}
            {COMP_ACTIVE && (
              <div onClick={()=>setShowCompetition(true)} style={{ marginBottom:12,background:"linear-gradient(135deg,#1a0a00 0%,#7c2d12 100%)",border:"1px solid rgba(251,146,60,.4)",borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",gap:10,boxShadow:"0 4px 16px rgba(194,65,12,.35),inset 0 1px 0 rgba(255,255,255,.08)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"40%",background:"linear-gradient(180deg,rgba(255,255,255,.07) 0%,rgba(255,255,255,0) 100%)",pointerEvents:"none" }}/>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:22 }}>🏆</span>
                  <div>
                    <div style={{ fontSize:12,fontWeight:700,color:"#fed7aa" }}>June Price Hunt Competition!</div>
                    <div style={{ fontSize:10,color:"#9a3412",marginTop:1 }}>Submit prices · Win a £10 gift voucher · Tap to see leaderboard</div>
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();setShowSubmitPrice(true);}} style={{ background:"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",border:"none",borderRadius:9,padding:"8px 13px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,boxShadow:"0 3px 10px rgba(194,65,12,.6),inset 0 1px 0 rgba(255,255,255,.25)",position:"relative",overflow:"hidden" }}>
                  <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                  Submit Price
                </button>
              </div>
            )}

            {sortBy==="cat" && activeCategory==="All" ? (
              (() => {
                const groupMap = {};
                filteredProducts.forEach(p => {
                  if (!groupMap[p.cat]) groupMap[p.cat] = { cat: p.cat, products: [] };
                  groupMap[p.cat].products.push(p);
                });
                const groups = Object.values(groupMap).sort((a,b) =>
                  a.cat.replace(/^[^\s]+\s/,'').localeCompare(b.cat.replace(/^[^\s]+\s/,''))
                );
                return groups.map(g => (
                  <div key={g.cat} style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12, marginTop:4 }}>
                    <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:13, fontWeight:700, color:"#0f2010", textTransform:"uppercase", letterSpacing:"0.06em", padding:"7px 16px", borderRadius:20, background:"linear-gradient(180deg,#ffffff 0%,#d1d5db 100%)", boxShadow:"0 2px 8px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.9)", border:"1px solid rgba(255,255,255,.6)" }}>
                      {g.cat} <span style={{ opacity:.6, fontWeight:600 }}>({g.products.length})</span>
                    </div>
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))", gap:11 }}>
                      {g.products.map(p=><ProductCard key={p.id} product={p} onAddToBasket={addToBasket} pinnedStore={pinnedStore} isFavourite={favourites.has(p.id)} onToggleFavourite={toggleFavourite} disabledStores={disabledStores}/>)}
                    </div>
                  </div>
                ));
              })()
            ) : (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11 }}>
                {filteredProducts.map(p=><ProductCard key={p.id} product={p} onAddToBasket={addToBasket} pinnedStore={pinnedStore} isFavourite={favourites.has(p.id)} onToggleFavourite={toggleFavourite} disabledStores={disabledStores}/>)}
              </div>
            )}

            {filteredProducts.length===0&&(
              <div style={{ textAlign:"center",padding:"40px 20px",background:"rgba(255,255,255,.03)",borderRadius:18,border:"1px dashed rgba(255,255,255,.07)",marginTop:10 }}>
                <div style={{ fontSize:36,marginBottom:10 }}>🔍</div>
                <div style={{ color:"#f0f4f8",fontSize:14,fontWeight:600,marginBottom:6 }}>
                  No results for {searchQuery ? <span style={{ color:"#22c55e" }}>"{searchQuery}"</span> : "these filters"}
                </div>
                <div style={{ color:"#64748b",fontSize:12,marginBottom:20 }}>
                  Try clearing your search or resetting the filters below.
                </div>
                <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
                  {searchQuery&&(
                    <button onClick={()=>setSearchQuery("")} style={{ padding:"8px 18px",background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.35)",borderRadius:9,color:"#22c55e",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                      ✕ Clear "{searchQuery.length>18?searchQuery.slice(0,18)+"…":searchQuery}"
                    </button>
                  )}
                  {(activeCategory!=="All"||pinnedStore)&&(
                    <button onClick={()=>{ setActiveCategory("All"); setPinnedStore(null); }} style={{ padding:"8px 18px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                      ↺ Reset filters
                    </button>
                  )}
                  <button onClick={()=>{ setSearchQuery(""); setActiveCategory("All"); setPinnedStore(null); }} style={{ padding:"8px 18px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                    Show all products
                  </button>
                  <button onClick={()=>setShowAddModal(true)} style={{ padding:"8px 18px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:9,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                    + Add this item
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════ BASKET ═════════════════════════ */}
        {view==="basket" && (
          <div style={{ marginTop:18 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
              <h2 style={{ fontSize:18,fontWeight:700,margin:0 }}>🧺 Your Basket</h2>
              {basketItems.length>0&&<button onClick={()=>setBasket({})} style={{ background:"linear-gradient(180deg,rgba(239,68,68,.25) 0%,rgba(185,28,28,.2) 100%)",border:"1px solid rgba(239,68,68,.4)",color:"#fca5a5",borderRadius:22,boxShadow:"0 2px 6px rgba(239,68,68,.25),inset 0 1px 0 rgba(255,255,255,.1)",padding:"4px 11px",cursor:"pointer",fontSize:10.5,fontWeight:600 }}>Clear All</button>}
            </div>

            {basketItems.length===0?(
              <div style={{ textAlign:"center",padding:"55px 20px",background:"rgba(255,255,255,.03)",borderRadius:18,border:"1px dashed rgba(255,255,255,.09)" }}>
                <div style={{ fontSize:44,marginBottom:12 }}>🛒</div>
                <div style={{ color:"#64748b" }}>Your basket is empty</div>
                <button onClick={()=>setView("shop")} style={{ marginTop:16,padding:"9px 22px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600 }}>Start Shopping</button>
              </div>
            ):(
              <div>
                {/* smart tip */}
                <div style={{ background:"linear-gradient(135deg,rgba(34,197,94,.12),rgba(21,128,61,.07))",border:"1px solid rgba(34,197,94,.24)",borderRadius:12,padding:13,marginBottom:14 }}>
                  <div style={{ fontSize:10.5,color:"#86efac",fontWeight:700,marginBottom:3 }}>💡 SMART TIP</div>
                  <div style={{ fontSize:11.5,color:"#d1fae5",lineHeight:1.65 }}>
                    Buying everything from <strong>{storeBasketTotals[0]?.store.name}</strong> costs <strong style={{ color:"#22c55e" }}>£{storeBasketTotals[0]?.total.toFixed(2)}</strong> — saving <strong style={{ color:"#fbbf24" }}>£{(storeBasketTotals[storeBasketTotals.length-1]?.total-storeBasketTotals[0]?.total).toFixed(2)}</strong> vs the most expensive option.
                  </div>
                </div>

                {/* store totals strip */}
                <div style={{ display:"flex",gap:7,overflowX:"auto",paddingBottom:11,marginBottom:13 }}>
                  {storeBasketTotals.map(({store,total},i)=>(
                    <div key={store.id} style={{ flex:"0 0 auto",background:i===0?"rgba(34,197,94,.11)":"rgba(255,255,255,.04)", border:i===0?"1px solid rgba(34,197,94,.28)":"1px solid rgba(255,255,255,.07)", borderRadius:11,padding:"8px 12px",minWidth:95,textAlign:"center" }}>
                      {i===0&&<div style={{ fontSize:7.5,color:"#22c55e",fontWeight:700,marginBottom:2 }}>CHEAPEST</div>}
                      {i===storeBasketTotals.length-1&&<div style={{ fontSize:7.5,color:"#f87171",fontWeight:700,marginBottom:2 }}>PRICIEST</div>}
                      <div style={{ fontSize:15 }}>{store.emoji}</div>
                      <div style={{ fontSize:9.5,fontWeight:600,color:i===0?"#86efac":"#94a3b8",marginTop:2 }}>{store.short}</div>
                      <div style={{ fontSize:15,fontWeight:700,color:i===0?"#22c55e":i===storeBasketTotals.length-1?"#f87171":"#f0f4f8",marginTop:3 }}>£{total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* line items */}
                <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
                  {basketItems.map(item=>{
                    const overPay=item.price-getBestPrice(item.product,disabledStores);
                    return(
                      <BasketItem
                        key={item.key}
                        item={item}
                        overPay={overPay}
                        onRemove={()=>removeFromBasket(item.key)}
                        onAdd={()=>addToBasket(item.product.id,item.store?.id)}
                        onDelete={()=>deleteFromBasket(item.key)}
                      />
                    );
                  })}
                </div>

                {/* totals */}
                <div style={{ background:"rgba(255,255,255,.05)",borderRadius:13,padding:15,border:"1px solid rgba(255,255,255,.09)" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                    <span style={{ fontSize:11,color:"#94a3b8" }}>{basketCount} item{basketCount!==1?"s":""} · {new Set(basketItems.map(i=>i.store?.id)).size} store{new Set(basketItems.map(i=>i.store?.id)).size!==1?"s":""}</span>
                    <span style={{ fontSize:10,color:"#475569" }}>incl. 5% GST</span>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:700,marginBottom:10 }}>
                    <span>Basket Total</span>
                    <span style={{ color:"#22c55e" }}>£{basketTotal.toFixed(2)}</span>
                  </div>
                  {potentialSave>0.01?(
                    <div style={{ background:"rgba(251,191,36,.09)",border:"1px solid rgba(251,191,36,.22)",borderRadius:9,padding:"8px 12px",fontSize:10.5,color:"#fcd34d" }}>
                      💸 Switch every item to cheapest store → save <strong>£{potentialSave.toFixed(2)}</strong>
                    </div>
                  ):(
                    <div style={{ background:"rgba(34,197,94,.09)",border:"1px solid rgba(34,197,94,.22)",borderRadius:9,padding:"8px 12px",fontSize:10.5,color:"#86efac" }}>
                      ✅ You're already buying every item at its best price!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ FAVOURITES ══════════════════════ */}
        {view==="favourites" && (()=>{
          const favProducts = allProducts.filter(p=>favourites.has(p.id));
          const favBasketItems = Object.entries(favBasket).map(([key,qty])=>{
            const[pId,sId]=key.split("-");
            const product=allProducts.find(p=>p.id===parseInt(pId));
            if(!product)return null;
            return{key,product,store:STORES.find(s=>s.id===sId),qty,price:product.prices[sId]};
          }).filter(Boolean);
          const favBasketTotal = favBasketItems.reduce((s,i)=>s+i.price*i.qty,0);
          const favOptimal     = favBasketItems.reduce((s,i)=>s+getBestPrice(i.product,disabledStores)*i.qty,0);

          return (
            <div style={{ marginTop:18 }}>
              {/* header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
                <h2 style={{ fontSize:18,fontWeight:700,margin:0,display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ color:"#f43f5e" }}>♥</span> Saved Items
                  <span style={{ fontSize:12,fontWeight:400,color:"#64748b" }}>{favCount} item{favCount!==1?"s":""}</span>
                </h2>
                {favCount>0&&<button onClick={()=>setFavourites(new Set())} style={{ background:"linear-gradient(180deg,rgba(244,63,94,.25) 0%,rgba(190,18,60,.2) 100%)",border:"1px solid rgba(244,63,94,.4)",color:"#fda4af",borderRadius:22,boxShadow:"0 2px 6px rgba(244,63,94,.25),inset 0 1px 0 rgba(255,255,255,.1)",padding:"4px 10px",cursor:"pointer",fontSize:10.5,fontWeight:600 }}>Clear All ♡</button>}
              </div>
              <p style={{ color:"#475569",fontSize:11,marginBottom:18 }}>Items you've hearted. Add them to your favourites basket or your main basket.</p>

              {favCount===0?(
                <div style={{ textAlign:"center",padding:"50px 20px",background:"rgba(255,255,255,.03)",borderRadius:18,border:"1px dashed rgba(244,63,94,.2)",marginTop:10 }}>
                  <div style={{ fontSize:44,marginBottom:12 }}>♡</div>
                  <div style={{ color:"#64748b",fontSize:14,marginBottom:6 }}>No saved items yet</div>
                  <div style={{ color:"#475569",fontSize:12,marginBottom:18 }}>Tap the ♡ heart on any product to save it here</div>
                  <button onClick={()=>setView("shop")} style={{ padding:"9px 22px",background:"linear-gradient(180deg,#fb7185 0%,#be123c 100%)",boxShadow:"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600 }}>Browse Products</button>
                </div>
              ):(
                <div>
                  {/* saved item cards */}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11,marginBottom:24 }}>
                    {favProducts.map(p=>(
                      <div key={p.id} style={{ background:"rgba(244,63,94,.04)",border:"1px solid rgba(244,63,94,.18)",borderRadius:16,padding:"12px 14px",position:"relative" }}>
                        {/* remove heart */}
                        <button onClick={()=>toggleFavourite(p.id)} title="Remove from favourites"
                          style={{ position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#f43f5e",lineHeight:1,padding:2 }}
                          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                        >♥</button>

                        {/* product info */}
                        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingRight:26 }}>
                          <span style={{ fontSize:22,flexShrink:0 }}>{p.icon}</span>
                          <div style={{ minWidth:0 }}>
                            <Tooltip text={p.name}>
                              <div style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</div>
                            </Tooltip>
                            <div style={{ fontSize:9.5,color:"#475569",marginTop:1 }}>{p.cat.replace(/^[^\s]+\s/,"")}</div>
                          </div>
                        </div>

                        {/* best price row */}
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:8,padding:"6px 10px",marginBottom:9 }}>
                          <div>
                            <div style={{ fontSize:9,color:"#86efac",fontWeight:700 }}>🏆 BEST PRICE</div>
                            <div style={{ fontSize:11,color:"#d1fae5",fontWeight:600 }}>
                              {STORES.find(s=>s.id===getBestStoreId(p,disabledStores))?.emoji} {STORES.find(s=>s.id===getBestStoreId(p,disabledStores))?.name}
                            </div>
                          </div>
                          <div style={{ fontSize:18,fontWeight:800,color:"#22c55e" }}>£{getBestPrice(p).toFixed(2)}</div>
                        </div>

                        {/* action buttons */}
                        <div style={{ display:"flex",gap:7 }}>
                          <button onClick={()=>{ addToFavBasket(p.id,getBestStoreId(p,disabledStores)); showToast(`♥ Added to Favourites Basket`); }}
                            style={{ flex:1,padding:"6px 0",background:"linear-gradient(180deg,#fb7185 0%,#be123c 100%)",boxShadow:"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700 }}>
                            ♥ Add to Fav Basket
                          </button>
                          <button onClick={()=>{ addToBasket(p.id,getBestStoreId(p,disabledStores)); showToast(`🧺 Added to Main Basket`); }}
                            style={{ flex:1,padding:"6px 0",background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.3)",borderRadius:8,color:"#22c55e",cursor:"pointer",fontSize:11,fontWeight:700 }}>
                            🧺 Main Basket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* quick actions */}
                  <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
                    <button onClick={()=>{ favProducts.forEach(p=>addToFavBasket(p.id,getBestStoreId(p,disabledStores))); showToast(`♥ All ${favCount} items added to Favourites Basket`); }}
                      style={{ padding:"9px 18px",background:"linear-gradient(180deg,#fb7185 0%,#be123c 100%)",boxShadow:"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                      ♥ Add All to Fav Basket
                    </button>
                    <button onClick={()=>{ favProducts.forEach(p=>addToBasket(p.id,getBestStoreId(p,disabledStores))); showToast(`🧺 All ${favCount} items added to Main Basket`); }}
                      style={{ padding:"9px 18px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",border:"none",borderRadius:10,color:"#052e16",cursor:"pointer",fontSize:12,fontWeight:700,boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",position:"relative",overflow:"hidden" }}>
                      🧺 Add All to Main Basket
                    </button>
                  </div>

                  {/* favourites basket */}
                  {favBasketCount>0&&(
                    <div>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                        <h3 style={{ fontSize:15,fontWeight:700,margin:0,color:"#f43f5e" }}>♥ Favourites Basket</h3>
                        <button onClick={()=>setFavBasket({})} style={{ background:"linear-gradient(180deg,rgba(244,63,94,.25) 0%,rgba(190,18,60,.2) 100%)",border:"1px solid rgba(244,63,94,.4)",color:"#fda4af",borderRadius:22,boxShadow:"0 2px 6px rgba(244,63,94,.25),inset 0 1px 0 rgba(255,255,255,.1)",padding:"3px 9px",cursor:"pointer",fontSize:10,fontWeight:600 }}>Clear</button>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
                        {favBasketItems.map(item=>{
                          const overPay=item.price-getBestPrice(item.product,disabledStores);
                          return(
                            <div key={item.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(244,63,94,.05)",borderRadius:12,padding:"9px 13px",border:"1px solid rgba(244,63,94,.15)",transition:"all .2s" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0 }}>
                                <span style={{ fontSize:18,flexShrink:0 }}>{item.product.icon}</span>
                                <div style={{ minWidth:0 }}>
                                  <Tooltip text={item.product.name}>
                                    <div style={{ fontSize:11.5,fontWeight:600,color:"#f0f4f8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.product.name}</div>
                                  </Tooltip>
                                  <div style={{ fontSize:9.5,color:"#475569" }}>{item.store?.emoji} {item.store?.name} · £{item.price.toFixed(2)}{overPay>0.01&&<span style={{ color:"#f87171",marginLeft:3 }}>(+£{overPay.toFixed(2)})</span>}</div>
                                </div>
                              </div>
                              <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                                <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.06)",borderRadius:8,padding:"3px 7px" }}>
                                  <button onClick={()=>removeFromFavBasket(item.key)} style={{ background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:13,fontWeight:700,lineHeight:1 }}>−</button>
                                  <span style={{ fontSize:11,fontWeight:700,minWidth:13,textAlign:"center" }}>{item.qty}</span>
                                  <button onClick={()=>addToFavBasket(item.product.id,item.store?.id)} style={{ background:"none",border:"none",color:"#f43f5e",cursor:"pointer",fontSize:13,fontWeight:700,lineHeight:1 }}>+</button>
                                </div>
                                <span style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8",minWidth:46,textAlign:"right" }}>£{(item.price*item.qty).toFixed(2)}</span>
                                <button onClick={()=>deleteFromFavBasket(item.key)}
                                  title="Remove item"
                                  style={{ background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,width:22,height:22,color:"#ef4444",cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}
                                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,.3)";}}
                                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,.12)";}}>✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* fav basket total */}
                      <div style={{ background:"rgba(244,63,94,.07)",borderRadius:13,padding:14,border:"1px solid rgba(244,63,94,.2)",marginBottom:12 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700 }}>
                          <span style={{ color:"#f0f4f8" }}>Favourites Total</span>
                          <span style={{ color:"#f43f5e" }}>£{favBasketTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize:10,color:"#64748b",marginTop:4 }}>{favBasketCount} item{favBasketCount!==1?"s":""} · incl. 5% GST</div>
                        {favBasketTotal-favOptimal>0.01&&(
                          <div style={{ marginTop:8,fontSize:10.5,color:"#fcd34d",background:"rgba(251,191,36,.08)",borderRadius:7,padding:"5px 10px" }}>
                            💸 Switch all to cheapest store → save £{(favBasketTotal-favOptimal).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* move to main basket */}
                      <button onClick={()=>{
                        favBasketItems.forEach(item=>addToBasket(item.product.id,item.store?.id));
                        setFavBasket({});
                        setView("basket");
                        showToast("🧺 Favourites basket moved to main basket!");
                      }} style={{ width:"100%",padding:"11px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                        🧺 Move Everything to Main Basket
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══════════════════════ COMPARE ══════════════════════════ */}
        {view==="compare" && (
          <div style={{ marginTop:18 }}>
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:3 }}>📊 Store Comparison</h2>
            <p style={{ color:"#64748b",fontSize:11,marginBottom:16 }}>Jersey Channel Islands · Prices include 5% GST</p>
            <div style={{ display:"grid",gap:10 }}>
              {STORES.map(store=>{
                const items=allProducts.filter(p=>p.prices[store.id]);
                const avg=items.reduce((s,p)=>s+p.prices[store.id],0)/items.length;
                const wins=items.filter(p=>getBestStoreId(p)===store.id).length;
                const winPct=Math.round((wins/items.length)*100);
                const sc = store.color;
                const r=parseInt(sc.slice(1,3),16), g=parseInt(sc.slice(3,5),16), b=parseInt(sc.slice(5,7),16);
                return(
                  <div key={store.id} style={{
                    background:`linear-gradient(135deg,rgba(${r},${g},${b},0.12) 0%,rgba(${r},${g},${b},0.04) 100%)`,
                    border:`1px solid rgba(${r},${g},${b},0.35)`,
                    borderLeft:`4px solid ${sc}`,
                    borderRadius:14, padding:16,
                    boxShadow:`0 4px 16px rgba(${r},${g},${b},0.15), inset 0 1px 0 rgba(255,255,255,0.07)`,
                    position:"relative", overflow:"hidden",
                  }}>
                    <span style={{ position:"absolute",top:0,left:0,right:0,height:"40%",background:"linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,0) 100%)",pointerEvents:"none" }}/>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10 }}>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3 }}>
                          <span style={{ fontSize:19 }}>{store.emoji}</span>
                          <span style={{ fontSize:15,fontWeight:700 }}>{store.name}</span>
                          <span style={{
                            background:`linear-gradient(180deg,rgba(${r},${g},${b},0.4) 0%,rgba(${r},${g},${b},0.2) 100%)`,
                            color:sc, border:`1px solid rgba(${r},${g},${b},0.5)`,
                            borderRadius:22, padding:"2px 9px", fontSize:8.5, fontWeight:700,
                            boxShadow:`0 1px 4px rgba(${r},${g},${b},0.3)`,
                          }}>{store.tag}</span>
                        </div>
                        <div style={{ fontSize:11,fontWeight:700,color:"#cbd5e1" }}>📍 {store.note}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:19,fontWeight:700,color:sc,textShadow:`0 0 10px rgba(${r},${g},${b},0.5)` }}>£{avg.toFixed(2)}</div>
                        <div style={{ fontSize:11,fontWeight:700,color:"#cbd5e1" }}>avg / item</div>
                      </div>
                    </div>
                    {/* stat badges row */}
                    <div style={{ display:"flex",gap:9,marginTop:11,flexWrap:"wrap" }}>
                      <div style={{ background:`linear-gradient(180deg,rgba(${r},${g},${b},0.15) 0%,rgba(${r},${g},${b},0.08) 100%)`,border:`1px solid rgba(${r},${g},${b},0.25)`,borderRadius:10,padding:"7px 14px",textAlign:"center",boxShadow:"inset 0 1px 0 rgba(255,255,255,.07)" }}>
                        <div style={{ fontSize:16,fontWeight:700,color:sc,textShadow:`0 0 8px rgba(${r},${g},${b},0.4)` }}>{wins}</div>
                        <div style={{ fontSize:11,fontWeight:600,color:"#cbd5e1" }}>cheapest items</div>
                      </div>
                      <div style={{ background:`linear-gradient(180deg,rgba(${r},${g},${b},0.15) 0%,rgba(${r},${g},${b},0.08) 100%)`,border:`1px solid rgba(${r},${g},${b},0.25)`,borderRadius:10,padding:"7px 14px",textAlign:"center",boxShadow:"inset 0 1px 0 rgba(255,255,255,.07)" }}>
                        <div style={{ fontSize:16,fontWeight:700,color:sc,textShadow:`0 0 8px rgba(${r},${g},${b},0.4)` }}>{winPct}%</div>
                        <div style={{ fontSize:11,fontWeight:600,color:"#cbd5e1" }}>of range</div>
                      </div>
                      {/* description — inline on desktop, full width below on mobile */}
                      <div style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"7px 12px",flex:1,minWidth:"100%",fontSize:11,fontWeight:700,color:"#e2e8f0",lineHeight:1.6 }}>
                        {store.id==="coop"&&"✅ Best overall value. Family-friendly. Large stores closed Sunday."}
                        {store.id==="morrisons"&&"⚠️ Prices ~45% above UK Morrisons. Convenience format across multiple branches."}
                        {store.id==="ms"&&"✨ Premium quality. Freight surcharge applied. Best for special occasions."}
                        {store.id==="waitrose"&&"🌱 Excellent organic & ethical range. Great health-conscious choice."}
                        {store.id==="iceland"&&"🧊 Best for frozen & freezer staples. Run by Alliance since March 2025. Two Jersey stores."}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:16,background:"rgba(234,179,8,.06)",border:"1px solid rgba(234,179,8,.17)",borderRadius:12,padding:15 }}>
              <div style={{ fontSize:11,color:"#fbbf24",fontWeight:700,marginBottom:6 }}>ℹ️ Jersey Pricing Context</div>
              <div style={{ fontSize:10.5,color:"#94a3b8",lineHeight:1.85 }}>
                Groceries in Jersey average <strong style={{ color:"#fbbf24" }}>14–19% more</strong> than UK mainland prices due to freight costs, the small market size, and higher labour costs. Without Aldi or Lidl, low-income households can pay up to <strong style={{ color:"#fbbf24" }}>49% more</strong> than their UK counterparts. The CI Co-op (Grande Marché) consistently offers the best everyday value for Jersey residents.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══ ADD ITEM MODAL ══ */}
      {showAddModal&&(
        <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.72)",backdropFilter:"blur(8px)" }}
          onClick={e=>{if(e.target===e.currentTarget){setShowAddModal(false);setAddError("");}}}>
          <div style={{ width:"100%",maxWidth:580,background:"#0a1a30",border:"1px solid rgba(255,255,255,.11)",borderRadius:"20px 20px 0 0",padding:"21px 20px 28px",maxHeight:"82vh",overflowY:"auto",paddingBottom:"calc(132px + 32px)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15,position:"sticky",top:0,background:"#0a1a30",paddingTop:4,paddingBottom:8,zIndex:10 }}>
              <div>
                <div style={{ fontSize:16,fontWeight:700 }}>➕ Add Custom Item</div>
                <div style={{ fontSize:10.5,color:"#64748b",marginTop:2 }}>Enter prices for the stores you know — leave others blank</div>
              </div>
              <button onClick={()=>{setShowAddModal(false);setAddError("");}} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:27,height:27,color:"#94a3b8",cursor:"pointer",fontSize:13 }}>✕</button>
            </div>

            <div style={{ display:"flex",gap:10,marginBottom:12 }}>
              <div style={{ position:"relative",flexShrink:0 }}>
                <button onClick={()=>setIconPickerOpen(!iconPickerOpen)} style={{ width:44,height:44,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,fontSize:20,cursor:"pointer" }}>{newItem.icon}</button>
                {iconPickerOpen&&(
                  <div style={{ position:"absolute",top:50,left:0,zIndex:50,background:"#0a1a30",border:"1px solid rgba(255,255,255,.14)",borderRadius:12,padding:8,display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:3,width:235,boxShadow:"0 8px 32px rgba(0,0,0,.7)" }}>
                    {ICON_OPTIONS.map(ic=>(
                      <button key={ic} onClick={()=>{setNewItem(p=>({...p,icon:ic}));setIconPickerOpen(false);}} style={{ background:newItem.icon===ic?"rgba(34,197,94,.18)":"transparent",border:"none",borderRadius:5,fontSize:16,cursor:"pointer",padding:3,lineHeight:1 }}>{ic}</button>
                    ))}
                  </div>
                )}
              </div>
              <input value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} placeholder="Product name, e.g. Oat Milk 1L"
                style={{ flex:1,padding:"0 13px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:10,color:"#fff",fontSize:12.5,outline:"none",height:44 }} />
            </div>

            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:9.5,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>CATEGORY</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                {CATS.filter(c=>c!=="All").map(cat=>(
                  <button key={cat} onClick={()=>setNewItem(p=>({...p,cat}))} style={{ padding:"4px 10px",borderRadius:14,fontSize:9.5,fontWeight:600,cursor:"pointer",border:"none",background:newItem.cat===cat?"linear-gradient(135deg,#16a34a,#15803d)":"rgba(255,255,255,.06)",color:newItem.cat===cat?"#fff":"#94a3b8" }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:9.5,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:7 }}>STORE PRICES (£) — leave blank if unknown</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                {STORES.map(store=>{
                  const val=parseFloat(newItem.prices[store.id]);
                  const isBest=!isNaN(val)&&val>0&&val===liveMin;
                  return(
                    <div key={store.id} style={{ display:"flex",alignItems:"center",gap:7,background:isBest?"rgba(34,197,94,.1)":"rgba(255,255,255,.04)",border:isBest?"1px solid rgba(34,197,94,.28)":"1px solid rgba(255,255,255,.07)",borderRadius:9,padding:"7px 10px",transition:"all .15s" }}>
                      <span style={{ fontSize:14 }}>{store.emoji}</span>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:9,color:isBest?"#86efac":"#64748b",marginBottom:2,fontWeight:isBest?700:400 }}>{store.name}{isBest?" 🏆":""}</div>
                        <div style={{ display:"flex",alignItems:"center",gap:3 }}>
                          <span style={{ fontSize:11,color:"#64748b" }}>£</span>
                          <input type="number" step="0.01" min="0" placeholder="—" value={newItem.prices[store.id]}
                            onChange={e=>setNewItem(p=>({...p,prices:{...p.prices,[store.id]:e.target.value}}))}
                            style={{ width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,.13)",color:"#fff",fontSize:12.5,fontWeight:600,outline:"none",padding:"1px 0" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {liveVals.length>0&&(
              <div style={{ background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.18)",borderRadius:9,padding:10,marginBottom:11 }}>
                <div style={{ fontSize:9.5,color:"#86efac",fontWeight:700,marginBottom:5 }}>📊 LIVE PREVIEW</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {STORES.filter(s=>newItem.prices[s.id]!=="").map(store=>{
                    const val=parseFloat(newItem.prices[store.id]);
                    const isBest=!isNaN(val)&&val===liveMin;
                    return(
                      <div key={store.id} style={{ display:"flex",alignItems:"center",gap:4,background:isBest?"rgba(34,197,94,.15)":"rgba(255,255,255,.05)",borderRadius:7,padding:"3px 9px",border:isBest?"1px solid rgba(34,197,94,.3)":"none" }}>
                        <span style={{ fontSize:11 }}>{store.emoji}</span>
                        <span style={{ fontSize:10.5,color:isBest?"#22c55e":"#94a3b8",fontWeight:isBest?700:400 }}>{!isNaN(val)?`£${val.toFixed(2)}`:"–"}{isBest?" ✓":""}</span>
                      </div>
                    );
                  })}
                  {liveVals.length>1&&liveMin!=null&&(
                    <div style={{ fontSize:9.5,color:"#64748b",alignSelf:"center",marginLeft:4 }}>
                      saving £{(Math.max(...liveVals)-liveMin).toFixed(2)} vs most expensive
                    </div>
                  )}
                </div>
              </div>
            )}

            {addItemStatus==="sent" ? (
              <div style={{ textAlign:"center",padding:"20px 0" }}>
                <div style={{ fontSize:40,marginBottom:12 }}>🎉</div>
                <div style={{ fontSize:15,fontWeight:700,color:"#22c55e",marginBottom:8 }}>Submission Received!</div>
                <div style={{ fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:20 }}>
                  Thank you! Your product suggestion has been sent for review.<br/>
                  Once verified in-store it will be added to the app shortly.
                </div>
                <button onClick={()=>{ setAddItemStatus("idle"); setShowAddModal(false); setNewItem({name:"",cat:"➕ Custom",icon:"🛒",prices:{coop:"",morrisons:"",ms:"",waitrose:"",iceland:""}}); }}
                  style={{ padding:"10px 28px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                  Back to App
                </button>
              </div>
            ) : (
              <>
                <div style={{ background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.2)",borderRadius:9,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#fcd34d",lineHeight:1.6 }}>
                  ℹ️ Your suggestion will be reviewed before going live. Once verified in-store it will be added for everyone.
                </div>
                {addError&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:10.5,color:"#fca5a5",marginBottom:11 }}>{addError}</div>}
                {addItemStatus==="error"&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:10.5,color:"#fca5a5",marginBottom:11 }}>Something went wrong. Please try again or email hello@jerseybasket.je</div>}
                <button onClick={submitNewItem} disabled={addItemStatus==="sending"}
                  style={{ width:"100%",padding:"12px",background:addItemStatus==="sending"?"rgba(34,197,94,.4)":"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",cursor:addItemStatus==="sending"?"wait":"pointer",fontSize:14,fontWeight:700 }}>
                  {addItemStatus==="sending" ? "Sending…" : "📤 Submit for Review"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast&&(
        <div style={{ position:"fixed",bottom:"calc(133px + 10px)",left:"50%",transform:"translateX(-50%)",zIndex:300,
          background:"#16a34a",color:"#fff",borderRadius:12,padding:"11px 20px",fontSize:13,fontWeight:600,
          boxShadow:"0 4px 24px rgba(0,0,0,.5)",whiteSpace:"nowrap",pointerEvents:"none" }}>
          {toast}
        </div>
      )}

      {/* ── FOOTER + BANNER — single fixed stack, footer always flush above banner ── */}
      <div style={{ position:"fixed", bottom:0, left:0, right:0, zIndex:200, display:"flex", flexDirection:"column" }}>
        {/* footer */}
        <div style={{ background:"rgba(5,13,26,.97)",backdropFilter:"blur(16px)",borderTop:"1px solid rgba(255,255,255,.09)",padding:"6px 20px",display:"flex",justifyContent:"center",alignItems:"center",fontSize:10,color:"#475569",gap:12,flexWrap:"wrap",minHeight:28 }}>
          <span>🇯🇪 Jersey, Channel Islands</span>
          <span style={{ color:"#1e293b" }}>·</span>
          <span>© 2026 Eamonn O'Shea</span>
          <span style={{ color:"#1e293b" }}>·</span>
          <a href="mailto:hello@jerseybasket.je" style={{ color:"#22c55e",textDecoration:"none",fontWeight:600 }}>hello@jerseybasket.je</a>
          <span style={{ color:"#1e293b" }}>·</span>
          <span style={{ color:"#22c55e",fontWeight:600 }}>
            🕐 Prices updated: {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}
          </span>
          <span style={{ color:"#1e293b" }}>·</span>
          <span>Always verify in-store</span>
        </div>
        {/* banner */}
        <AdBanner onEnquiry={()=>setShowEnquiry(true)} />
      </div>

      {/* ── WELCOME SCREEN — first visit only ── */}
      {showWelcome && <WelcomeModal onDismiss={dismissWelcome} onSubmitPrice={()=>setShowSubmitPrice(true)} />}

      {/* ── REPORT MODAL ── */}
      {showReport && <ReportModal onClose={()=>setShowReport(false)} />}

      {/* ── ENQUIRY MODAL ── */}
      {showEnquiry && <EnquiryModal onClose={()=>setShowEnquiry(false)} />}

      {/* ── HELP MODAL ── */}
      {showHelp && <HelpModal onClose={()=>setShowHelp(false)} onShare={()=>{
        const shareData = { title:"JerseyBasket.je", text:"Compare grocery prices across all Jersey supermarkets! 🇯🇪", url:"https://jerseybasket.je" };
        if (navigator.share) { navigator.share(shareData).catch(()=>{}); }
        else { navigator.clipboard.writeText("https://jerseybasket.je").then(()=>showToast("🔗 Link copied!")); }
      }} onReplay={()=>{
        setShowHelp(false);
        setShowWelcome(true);
      }} />}

      {/* ── SETTINGS MODAL ── */}
      {showSettings && <SettingsModal disabledStores={disabledStores} onToggleStore={toggleStore} onClose={()=>setShowSettings(false)} />}

      {/* ── COMPETITION MODAL ── */}
      {showCompetition && <CompetitionModal onClose={()=>setShowCompetition(false)} onSubmit={()=>{setShowCompetition(false);setShowSubmitPrice(true);}} />}

      {/* ── SUBMIT PRICE MODAL ── */}
      {showSubmitPrice && <SubmitPriceModal onClose={()=>setShowSubmitPrice(false)} />}

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AD BANNER COMPONENT — 4 slides, scrolls every 2s, fixed bottom ~20vh
═══════════════════════════════════════════════════════════════════════════ */
const ENQUIRY_TRIGGER = "enquiry";

const AD_SLIDES = [
  {
    id: 0,
    link: ENQUIRY_TRIGGER,
    bg:       "linear-gradient(135deg,#052e16 0%,#14532d 45%,#16a34a 100%)",
    eyebrow:  { text:"ADVERTISING",        color:"#4ade80" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#4ade80", after:" Business" },
    sub:      { text:"Reach every Jersey shopper — every day", color:"#86efac" },
    cta:      { label:"Advertise here",    labelColor:"#4ade80", url:"jerseybasket.je", urlColor:"#f0fdf4", arrowBg:"#4ade80",   arrowColor:"#052e16", boxBg:"rgba(74,222,128,0.15)", boxBorder:"#4ade80" },
    stats:    [{ val:"950+", label:"weekly users" },{ val:`${BASE_PRODUCTS.length}`, label:"products" }],
    statColor:"#4ade80",
    accent:   "linear-gradient(90deg,transparent,#22c55e55,transparent)",
    deco: true,
  },
  {
    id: 1,
    link: ENQUIRY_TRIGGER,
    bg:       "#050d1a",
    eyebrow:  { text:"PARTNER WITH US",    color:"#f59e0b" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#f59e0b", after:" Business", highlightGold:true },
    sub:      { text:"Jersey's #1 price comparison platform", color:"#94a3b8" },
    cta:      { label:"Get featured",      labelColor:"#f59e0b", url:"jerseybasket.je", urlColor:"#f0f4f8", arrowBg:"#f59e0b",   arrowColor:"#050d1a", boxBg:"rgba(245,158,11,0.1)", boxBorder:"rgba(245,158,11,0.5)" },
    stats:    [{ val:"5",      label:"stores compared" },{ val:"Daily",  label:"active users" }],
    statColor:"#f59e0b",
    accent:   "linear-gradient(90deg,transparent,#f59e0b,#fbbf24,#f59e0b,transparent)",
    grid: true,
  },
  {
    id: 2,
    link: ENQUIRY_TRIGGER,
    bg:       "linear-gradient(135deg,#7f1d1d 0%,#991b1b 50%,#b91c1c 100%)",
    eyebrow:  { text:"🇯🇪 JERSEY LOCAL",   color:"#fca5a5" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#fca5a5", highlightUnderline:true, after:" Business", headlineColor:"#fff" },
    sub:      { text:"Built for Jersey. Used by Jersey.", color:"rgba(255,255,255,0.7)" },
    cta:      { label:"Book a spot",       labelColor:"#fca5a5", url:"jerseybasket.je", urlColor:"white",   arrowBg:"white",       arrowColor:"#b91c1c", boxBg:"rgba(255,255,255,0.12)", boxBorder:"rgba(255,255,255,0.35)" },
    stats:    [{ val:"Local",  label:"audience only" },{ val:"Zero",   label:"wasted reach" }],
    statColor:"#fca5a5",
    cross: true,
  },
  {
    id: 3,
    link: ENQUIRY_TRIGGER,
    bg:       "#f8fafc",
    eyebrow:  { text:"YOUR BRAND HERE",    color:"#16a34a" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#22c55e", highlightGreen:true, after:" Business", headlineColor:"#0f172a" },
    sub:      { text:"Sponsor Jersey's trusted grocery comparison app", color:"#64748b" },
    cta:      { label:"Enquire today",     labelColor:"#15803d", url:"jerseybasket.je", urlColor:"#0f172a", arrowBg:"linear-gradient(135deg,#16a34a,#15803d)", arrowColor:"white", boxBg:"linear-gradient(135deg,#f0fdf4,#dcfce7)", boxBorder:"#16a34a" },
    stats:    [{ val:"Targeted", label:"Jersey shoppers" },{ val:"Affordable", label:"rates" }],
    statColor:"#16a34a",
    light: true,
    accentBottom: "linear-gradient(90deg,#16a34a,#22c55e,#16a34a)",
  },
  {
    id: 5,
    link: "https://www.ernies.je",
    isAdvertiser: true,
    bg:       "#ffee00",
    logo:     "data:image/jpeg;base64,UklGRqzyAgBXRUJQVlA4TKDyAgAvKUPKEBlIkiTHbaKmEVsU/P8HA6BvOkf0fwL44bNBFUV6768kyFt6b+2SRE5VULnVWiXi9aJzXkz8d9VRRjXLOnWgn4hV5fWvbrMU/Dp0LYDWhl9RTPZBa/0TmiQXeu/wEHf2C3rn497Jl6+b33gDR7Zt09Z4vqpX34p+/1u1vo3QvMp+7Da2bVVZuEvE/PCVQPj6rwZ37nwfR40kOVLsnn0dhFIh2Nd50/xhHJT+TwD+k/Y96j0D4FjHbZR90Y148+XJFYTrRsxGPJtytB10cGpRtikHeOOaEMI14QPsxbbURvtoUQ6eCejPXGggU5lqF0EIIF+QVkBeQgBIi1ZlDUmwDgVrNgBwf/ABAr4AQK4VwNGtLyZHhgoAYA6wBL0bPxtRtF/WAP7oJIV0FOADAoAW5QRDAJoSYAydhubgmRdeDAAQVBQULEFArzngfo5t55fWy7DAC9nLHvqzl0I4B9M26DVmLAwAoDXleaxH250yS5c3IEmWwnUiSZYMgFj1mSr6KchGhKBNGFLUK0eM3KjPRemtR0AIuQf/Y/U4cts2kGLJ//902s6e9hwREzB/YO4/uCaAAvmK9qw8YTvXtpI5BlvV3iV7Yj2+yAr1lwfVnrBdFSD0VHVVNUkGj/XcxUqw95luM8fg7SiZa8AHJfOagBvIfA+QzJ9sNf//d7KV9/f3v5ecc8451UATVEAl1HMcneBzzjnu3fn/PmR1nzO7Y37fArC3A5o4lizjyJ+eBgh/TQlZ08Kx5CTXjt4WxqKRJ1lysGtHI0EeewsgxyZyqCHrY28NQyog55xtThaZ09qR9LAV0EKsIR55LDnJKWQrQdPCWbkai1xLA/Hg6AJ7S+BZSwvoa6khdpEzaNwcMqcBHp6Hcm3bqm2lz73P/7hLiaLViIEkiIDwXky4u/vZa9KxbUmRJH0zh4ikzsKGYWYenTXmbcwWZnoBI84qQGIGiZkZmguTIzzM3c1pbdtmSJKe94vIyMosDNt9rW3bts3ftH9hz/dorj23bdu7Y1ZlZsQ3AZzv/182SZry+Xx/13XdFpJZ3npcZnB3d3f/C1i7u7vr2t3d3V3btbwqMyNuva7r9/si6/uOyMJ+OIm7O6M7HBJnXGrFOYHfOB0443Pj0DvcGbclDoGTza4Sj/EJHAJ3iSW+1FjkYeXuBE4+Sxyy8XubOPSKSdzdNXCanVuMT+GMzzyCBe7uPIK7O9SO49B1OIlk7Ui8C3cL9MHdrZCV042TeD3sqnFqx73C3aESd3d3t268il3gVOD0MnB3d3d3d4cqPHESpxKHFRO47Z4l7m7jrolTeDS7J1ZzTi3H123bpm3b2pZyqbW1rjH6wNTy5rGfK9v6A8/d8+d8ad3Z9nO4PDlGH50NtWRe+D8Zsm17+wUys6o1POdcxrb5t23bNq94xSvbtm3zfbdxtHHO5pprrjnHnEM9enR3VWVGhO5t29dGkqT7k2SOcGREZCRUZXFVd0EzM8wyM/Px/jN7tmfMPMzTw9RcXA0FyRDkINuyJX0T4PsC8OWWJE15nuf3vnvvo6GZkVrSLuPuLn/B/Auz5k8YHO78X3D/R8Zd2rtLutIj4sTRLe/7/p6LTJz8VndhD96Bu7s7Xd9ozBUrB+/AefEXpzdO4j8cCrlyTdythiv2+JzxqYPvQr93jdfGe3w2TjfukgsCZ3wGh7fwjRM4MT4vzrn8vr7ii8XUDe7jMxuncApnBx44gVOFfhsncZcvL+pbrHH9XBInG81krbETaB08E2d85uDuzkjiOpKFE3jgnMRJ7l6cKtylAnd3q8YbJ/Likyj84MTGSXzjVK31jV4Wa4274lCNduDkwaPwg1MH7S60z1y6O+4uiVc32vFd5uX+Cq2Nc3A427at2pIkac619j5w4bEwqIgamwVHMjMzM2eWmGr5B/wHzFll5gwOZ1czVyZRFZHHlw7svSZv/58USZJk/f9/EVUzd4+IzKys7uruYTjMzHzOFd/TK5xHOK/BcMf8AMzM5wzvDhd2ZoC7m5mqiPjftu2QJG3b1uOMjERlZVZ1VXc1h5dt27Z+vP8527bte2zPNEpZyciIYwJ80f+33JYkK8/zzLnW2haeGRmp5V7VVe163N3Pwd3d3bnlyt3t4M5xbffu6nJJ94gMj21rzfe5WHPtyKpGDndf/ATuVmMgw51TyGFsnMDpwHnxB6dfnML/OCdxlxqMwjkHT5zZ+MTJdTkLf3B64o0zcU4jly6BEziF8zb+4mycjfNeMcYegyuXzaBwd2fhBE7irIKrjRM4gfNeYIm7xYDEXU7hBIOrwCNxZuMTz8BJnBd3d/ZF4i5VOBPfODsu2ZcPThVO4zVxd6cGdfDEybrMxhdO7DuIy4lThbsEg8bd6gYpnMCJwDfe8zYDT/xsnIO7Fa7NGJp49bk7CyfwidMvTmIXHrD9Xy+3ra7n8/39F8ysYRLLtszMFHBiCjlNGiynzKc7b9/C2WU43czM7dkpY6jhpAEzo8ySLNmyYEYwPGut///78TYAkiJJkm2JiJq5e0RSUePgYWbGr/eHH2a6szQ829PTXZgU5G6qEhPgxf+3WbYky1nLPCKyz6y+7/tiVeqF+gEIaVqai5BoS7sJ9C2qvs10txesZbb3Oe4RcYL9aIxBHRa8MKhLrIIu+OBFBR+qnMQdQ9Jd0ARjQ1OvBx8qaDMJ6vRSK/jSoE5f6mPYMzmCh4pawk2DluBD7xR0QELhvnG6YSRddMEbVPRVMwodkFOoogaDnoA68KWRU5BBaQC9BpA0A2bBTf3QgEZLU4iZFA3qAR1eozeZkjq9E1BL2ylcqkMDmsTuQmqon1vbjm27bavux/W8eD6j2bZt262lyu3W8pa2lrXIqcP2J5y3yOo23/e5jt2TJNmqbdu2ZW6l9TE2M2N4Z2RnnneImZnPnGfO3mrxmABAnvyf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8/yoFrxY5XhYGYCzUoJbjlI7654H29vUGp37SsPuodtt1P8H+TyDUwjb/Qe6WFkvU1o9qhRVUbLZzusVJja5G3C0Bi9c5gMLD/VbuyMRxjoHXbvI40cvjvTwjd9/qshQ7e3kyo3+Pff9PVRwfOM3vcwb7ftKzxzej4zKHgl3HoeMpx0vgORzwRrN7nA2cxJc8QL7X1/4HQw7/3rPghOFshTpCAzggBcAegyyQroGoGrGtwN4DMqhKSYUssJBBkUBGDFohVehqSEA0kIMdKG9FNqg9+jlIRCAADkNGcVjuCS0gvccFGC7gQXyWqhfbFcwAV+DlrwCVT9VY30opMA5Tno7sr0RVYAcgI5c3XByc74TaYQY0GVNf8nCIH+H9XxzP43gNPMpZrWjoUmG4YJuhAUuDsbv73bEydAEcsYxoK+TwgVIwlBGNVyEeb0RUTImCWJQElRRZsmi0SBVEmSKliKpEZSBXiluTDAmikBRoiUjRqnZDUhwEJX/r1wiMQCSJAU4AGKNUwhi4FED+XQNmrUAhZ8iJyYrPYgcrl1cSRjEwxl9A2KktMeSPnX1lQE4NLOcXsnHZ4orYUiyCVgXOje3EfBBivytZh+8L/Q6uR3+Az7AOcvRAdqiDC2zBuGCn4NayorFKhfCXNoNAUEZnmNgF4QxqmE+Zbo0V6g+oqZI22IkiAVZSpDFIFS0JkhSqqUk0R0Km8BR4XPKZT9tIIhKRJKv6z4b9O5kMsjYSgin+6z4piNI+NzJWRVFowbXA1A62CqbQc5JhiDyorAWF6KyZF6Lrs5QYVB0xKAy1dDrVnbIhhOVi3ErMWRjGwHJOnBjnxCIWU6M6KoOelF0Gb0bssItQe0xx8wBzw/lCjyXWxbvFF1MX+IG6Tun9bfEHoBkxoy44nt+KTTJaR+O41Vc0KqkfacnDrez1NY/v9rnv2e1zGzr+V2DXzwi1OyoOsdUl2uVTnsO9WwdUCauKo4YQiFbo0v/JskVoiITY1Vk0PI+wRIRSi+mkSdp4g5+FZliQTZZFzKJQ0hyKgWcPtIL5jcPKVdBjKUOfnhkETI8qWQEU7Di9jChNAtybAwuRs0/1Btkn/OwuTEx6e2Kmyu3KvWmLmap2yoaZ2r7T7Nx509MEh4we7X+QgSumKMat3tWKztMtDuM9tOdaHtXPFf9iUH9E+gvUx6yDY7Q+AttRn5+0HcXA8MBj7kb/Rznahz96eYTT/B585N8xe3t9jRHipcRp3M1JgN0CgDcOqad0XjQBczvv8yEBLmKe0FRoEqT+EkKsCWkry1PikauiMGJFY6Ihhj+Ehki4suUUiyWLOTtKDUlcuatmuv1+aKK1ZpFF2IDWlWmGQM2Bu3szuwtozVgJpWAtXDcCbe/RQr+bvcpVngGTfarlnr05cM9e5V57rYcw/U7vytVMx9eEEE4ZC8jG4MureffHdirXAlWsoXp6Z+FjPyKeO+9kdSguW/kLlH8NZzGDlXrKA6oc2XJp1WZTCb1fiwxeYbn96PfwnRnMMe5getT5pf+DzQ/CRRm/lBUNP9IITnhDWBO2DE2Eq7AzhpyI5Qoa4yzi9Uo5IFSkS0FXG6kZGcWUdBtItOB0KTch17GFFoRzdwfWTL4Khef2hqjg3XXZPffvZ2Hc53y9u4XonVW1vufLs2pwNWMxqEpvwpL4qleDZqnQVollnltrfWo5iC+7hyhC5G7e1CpkWh5DuCE0RJcNpnpFiR1YYH03DLAUbIPXhRj61YxKPrcib191mu5rA6LyyR9tflrH76wQnVhGHMRwLmMF/g38stXvI70ujOmD3tFotLBWC7bNdrvMqjJ6makzdXu4jn8DN4frtwMKdgvuL/mtjThX8TnHW8JawLRCblBV6CK6EbpJzWJa9GAVzTMI10apxChoJQJdKSQTNDLCe2xUV6quqVBCUQT8yt6e9N60W6FBu5yMd7/gcZRsmJnhsuyTYQwBEKX6wnD6zrkacAhNYRCT2eQC4lFanERTAes0SjnMrRfuF6fwLgbEKhUl1i+03QbEBTbkhVuGFCxMEwwp/MUusMUOyB02sIBiCoaJISwJBbCIABTAlhabsEX0wmLuFwvyjvOzCmNDWBl3H3z8+1u29AVuBYMFK0HBZGem6m+CkeEBtBCU5WI9LuNSu3EotVsrqHdT8XP4r8P0XlCO/F/8Mzysq3ckGB3jtgMXBtCAPMelHX7LeNpX+IpGGuYogP+3AnzRA1yHgE87gOsI4puRu/h2hPX5Gvvb99lvN1B3GLcKFb2/MCqHgHwQNA9Psk3sKQDsmFNwciEITQBKC0xGsCBUQKfSOs5WAgbc3XE7aGItVE3FbQIjaRaugFPyHCCcBmkA18bzoJ0giCEQyXPxBDCBh+RG0QG6ClfjkXQdUZ02YZPz9YhqNRraJlUfjcGIan6S0ZCNPp8cNShsZr+0Qmu3yNG1GrYhU1gPm5ZVi9eawFvaNp5mqqxV1AFTZFpQxaZUvZTuuF5FrWXdStNppkC1YGKYHFr1lkcmH2BG+JKYoK4MqRABrKAbokEAia4CF4BQTWCUUCGUAKFcqsbB4xCVgIxPbYWNAFBlGqDBMGxu5lpUp9OCbZkB7EkM2+hmaT6J/zfg1AGWTk2nRJz/luoXfwn4cAF4XAC+mP95ALYG/FIL+MJn/mAuzArAvx2XnD+FVR8jNbPipipnvta6nf2eOWtbYwT44S00//CQTkfRaR9QfRtSPA8pYgQ6BjrFoU7zq4Bx+G5Qg3RQ0xXMJE8DTKK9BB1mWQh8YQs+RgJJ63pDM3AipnQfyyII8Lx4gCZP5IK8mgoGujrHyIvkonij/DfdyTgFHIJXnEv6C70W1+TW4iT4j3sF3FReSyNhFa6gLRlr/5NVHVepQKEaEOHrVEqnrOFU8CimoQ0fzTLd6I4k1dBiQ7VtoQ6gjDhdVyWuOha32iqgC2u2bjUj/RBMh6Yz/oT/f9P1V/8vVO+i1mW9Qr3j2siYaeNnaqtYABuGPFhWlCXlQilZJBIoJgXzc0YGcCrHJmmgitBcFsAAIexgQK4VA6kuCENFqVOLT+0aNZPO5lq2hm0BaEBLYpz/A9H+CXVe6OZxgXFaYbxf6bRuUO0Na354HLDO8+1YabOGZI22962TW0v6uuvf9QT8kwlAPvgJ81+MV/jBr4SKLJsuf1wNbqMGvO4CXi95zdH7/WM9+mD7LurzhPlpl/l5jxnf4DQ+w3bvQBvUEf8AxIw6oCrQGLBlgBDBPmAKEDCbTLGlgFWWZwOI4iWAAhyJS9FGnic2owWJptEi18AhPMMTeEH/cZfkzMaN4s7FDSlQ3IAv3yviBbhMV/6FdAE3EhTRtWjInoffDLMUy1PLVQAZEZRw+TFFs8qjPiFkujiSdGYPrmpp50hZioHbaxVfuKs10mKiGcpQRGwSHXFYAC53TiNjqrAOFx/kk9bVVutAd2jCpo1aR39C04HlgFlSNSgrPzTKgVqhNlETbAerSem5WGn6+liSH5oyeMijlYBzeRoZ3aUIRIiVDDfSBUo9IgBKqJJUZE6uZTfzbJ4oCwA2qLZBLcmUHwT7Y/4aUf4I4vzrOn08UfNyDvjiAvC0RPmSzTeAvqW6ngHazPW+edADb7ceve/eu1/7/xJWv5YA5IOH/FcB/4Gvxr/8/5CX+eSvjA/kv/8IcC4A9X9cgJcdwPOe9h8mqD/9gNfcfsq2ofpa2PaCeu0BogfIHqBqtrzGVgeg4fp9u3YB0qlv8h1MRCDRlAQQMKuT0Q5Qi+dFS3gml8GTOEwOxJXkPHmjKRC8CdwKjsuP/29cABWqcVQKQd5MupBXySNAcSzQGYz8m9jCIgdhlMUDICguFOdvwmoCfw8YYVBLZN+1kh275piJvPFLMlEhVfCaOlQFHaElG3z9znh395BqYJElbe1nWaI/NbX7kbBioW4YGVGUJwpPUWILJWhshe7k8VFVEcMkdUBVUkXGodBYe5iPkEVqIYGehhb+kZYXq01qkX4e1qKkklhtsS2lSKpLP9gU0sdqG1kcVALK9PkqgDKxApTkaScpBGECQGJ3cwfrZYSyPIcyZQE0OjW3A20Gsld0Pm1QbYtaGrZLR7W3gHOHWhvU+S8AT3+H+DADfDX73gLaEjAbwIfma/VX/Xk71v9nHvTgN3zV/qN/zdUP5qF6q/x5AdcKcKsB+wDwOgA89wF/XrN9d6j9/kHgPtXpPkIdY9Sxw4i36jw+zzbjmwwIVO9OdjrXMxNbZRB0SrITIqM4JWwAc2GAl2CFK+gonopL49bGIRQEhSh5lMJsCgGFQoXR5SHu7FzCl+9CNEBP5DFpJB3mcRxlhkUg0BZeV4JlYQcgLDykLjuOAkTM7ibnUrmZk9k+e5AkCwh6TSM9e6aCqcK0Rr1lW6yr+iHMjszfHtOiLvlB1qxTjGHwuO9krVLStNHU06PGNiOyVdOLBvXvmnc2+m2hAQ1sYVF4m2Vdz7L2yoIywrqxyTKyMWsNllWLPW1FsKfGEpVQBKTlRrAPmRY+SqqkAjARWkEz3MPn+xXbSX64aQ92DqksqT6km5LOGzuLTbLzYKWiMllGVogFesyPhRBUNejmk2yrKYEZlCAsEQZAAAhkBmjx3M/1DRvMDrgAnAGWLUj/hej/zXZeos5zRFujlnPU+gjb0yuopxXg3QrwsAGsDeDLDeBlC/hpC0D7YBqqiwDnAboCjCW4LF9r+GYbyjeXIb3sAo9dwOsUdB2zX0fatjfpFD8DbvufFtuO6hEfD1uWK4527pA7sKbgv+o1ZeHkURBpg526guvFYfGqcZAKDr9YZzL/AKeUvJpfbF4lX03eg1vELeb1f/wukyfyongOWJx2OHlHUSdCCEhoTok1BQhCmYCNWghaVnNBo78B5vTFWplsUEaSoclgkYmSJti5/MK+QXZLViKrS7gYlBO1hftElsDCgs3V/eVse/sx1bthwkqpoxowGuAN37jmkd6KtXQNU0RubVx32TZWAe1m3T6garKzNlAO7W7pNvUm2n76MKJHmkxta9q6RbUaNRu1F/qeX8eOVWzbGts2tG0zFwbYOcT8wPPDWqg9P0w9JS7kIXEV7Ym9vIAtPMlP3uiJGNSiEP+4TqIbOk6R2GQ3WlCkv4GVbqhLtksqT9+FH24qQzqZ1JJSVtIsKYOP19Zky1lBNkVBKImiWOEoIAoAAjRUK9nMTNQ2nyvKzADQYbT8NbIvqdMC1ZYY/feA7/4H8MUC+P6UymWGsSyAD3PQwx2wL44BWAE+bAG9A8wOMBOAfPCKF/0v/t3oOu89vb91Etf65gTIJbgdgLT5FaXLzZbG5Sbz/Mts1+9TeR5TuVVgr4VZBTWLzjFg5j4we08CTIudW5P/Kqo8SVvQBJpL2ctJO0EBDuIAj+LQ5DXlq0wkycvkRikoZVNwt6v80OQg3jb89F7fM3AdqjrBPZplBkBImMeQhrQWQBA9URVQSgoFOtODk7SZdJtSyaQz9KZVj8lANv1+kmlSOr3CNiF36BN3AzRFtwXawxVXgU+cy75IgIVqOcqWWgaVnMtFWmtI4RQ1DHkaa5CMWbWgbSFBVkqSZcCJSxK0yHJhJZWwSmseicKqzpZV2EZ2IDsMNexm2K1DD7uqWzQIrieFBBMmuZvFGO/GeXDmaTSFMR6ydZjApBE8Fa5k7Z0qQpVAzstkAOU54eKbXv/cNliaiZ9mzaGL3qQIKXOpVUr3YvcyUCDVdZ/jz8N2l0ZKs1gElVJmMGiiIGBFTQHcoRkKAkpDEJ5/OxCTqmy/0gDYouwcw5eo1rG9a3+X7Kdk/7jV/vT71vz4p4CfngHen1I9zwBtDtAakM39nnz2wf3kj3LdlgDIB5dQ3RTgKwPAQ3A3ApsJeGOkenZdtfkKWO/CuyGiDV2tfdCeBcS7AFGjBowdYLh+569V7lgscgKBGrQXrKRRuICTkkdyjJxKTkDBijNDPrm8Q35ncrYoTCWnUgjxqnMp7hScCnsfyZG+tCPRToCjCsCkKrUadQo48imRCSWxkslokenMoJfBOqWeSqpNvUqqPdh2sHAFeSDccQ4quSKkQpR/3I/lTcgMFWqTaJ4zIQQI1SdeJ/P7qBQRMXgBgjKCV04LyraWrJ1lZRI7EXBlu3DSVVRX2tLFA1ZYdloRqazGNBKt9EauIVoqaTVUKvlbiYwoN88mEHkuXgKOVPZxWKjDCuIMh0c8rwpeCpvN+Ha1dZouWoTx+ZAryQEUErESlPQ2j6ozk4AEZQyCEPLmaAUNuo8jApEwC7WNlSglSrXU26WeJmXaYnVuYLehXqzW2DSpoIdZkRRIcWWVQoAY3ERNpJh5ALNSrd4Oat4Q0LFfHmVbnoA4r1Eflhi2ornNwT/+E9hPnkO9m7F9WKCWxf8Y8LF9jw/moEKAz8fTeF2Pe6ZVOLfykKepB65HYP082F4GuynyZkvLZiNdjE+T8W/R++lfQiZwo4XiljswZrCF0jeZDZhUZiSdJjZiiSZ4FnQlb04OTA4pm82EJDea3N7ko3EghWoKSLkIziz5THqA7/kRJshxICCBSoqoJgI8jkZib1JjsH21Zj5b3zxa17jBY9e3XKXTnVrtsNsQX3F6ppd30BNkIE2EKUqWWiebT2w0JD4MFH+mKJc53xFJJAFQB1Dab5oDFgN4h7jV0AIL3FihtjUHmUYWOBAkcZAHYiuLC6thOYuCWBVZgevRCjfu0TlNshVtCSsUW2/kJcBSbvTM6TAwkZ4Fq8Gh4LT4vLz5xKtdDq4wSbYMI1MY3txdhKutlnJtmFFFTiIMVQOWGhDludbYoAFEQBo0Awb7P1/b6TdiG9g99VpKLbtMlkwa7IUZ2DnLJ7tNFo3ljVXBnkXBoQu6wyoIqV0ZUQCzYXfzGNYBW+5hvwB2Oi1rwOkPIN79H9UvzphfndnDOgOt98AuL4I9zHINm5Fl2wK+aE+/vbSA3+oA/1gC0J0y4S8FnykA+qBugLshxpsx+pspuNy0/XaTvr6s2vwzV3fP0rtCixVm3BYa6ANMZZ4KVwnkYHduoD0wMrQDg94xR3IacgleFD1Rvit5OXdocmbypXwfctU5A2UT5OcuXyBfjENwm/QX0kFQ4e7XPdwESvWAmibt8odSKj2z62ld33IxmBeZ9dQfST2+sfspozuVN9QFO02qgEKyqqARSVSVLs2FvawYkUZ4dEWiRCBATIM9VX1J/MRPdjSSFiCJCYJIp+IJYEFK4QGU6MRhjTRWoUNx4TQaWxdOaD6RgXOCMa1QJN4lDkAASYJSEAQ6F1ksis60cwpYdragJga4OTk+uJ7eng7hEF1F7S7wcMLDSs+L/CAjgFGWiWkz0sFQc5iom0JNbmfsQ2MfQNiIBMBiVt78N3A7ZKPCWNZ9rOkE9jr1ZOhRSjfyy7X7kvLwkdq5SYfYkD+vVUQZKV+gGaoF2aCUSAabJVVaABmA+/UCOIPQiu3Ssn/o2Nf8MlDrL7N9fA7rFxekH52p+WkG6HPAeQU4zQHLGny8AchTHqisAF8agN0I3G64+vUPsz3+a1p2u1puSrabIdR6rrY+GMeq+IgW3wSjfY/knk1mxJDXEu5ZnvU8eZYckLuHXHa5oEKBX1xWUpghv1/kh+474RTjWMo3wfHiErTKM3Fujht7XxCAARRm5wIZ9VqXOnYbt6v1knXdof+I0seSWrygdgf9RmmAXMASloBIukkAQwEUgjKGKlEFMYBiOscXjDCLkZqIkSkUiVkAAVACX0TaOxMRCYwE0SIkMYS0ANhvXYAUOr2mQ65fyO4QOye354Q4yMqhcP1EI5cnPSf5cpMgLTCBCWrFIFgwbOS/aSCXZoMgWJxdfITTJCxGs3ByuoKGeBR1OXh2wlMHu7N8nEyMh231arjCcJdG8zDOnaPgGWGYOtBRdcWPEklgADQosQoRwab5/X84mQbSR9K7oF7fpRpKZUoB0kqptkllkxZZICsMwrTD7RGGJcIChBS2xefKJjT7SuflMVQ7BTxtKJ7WbO83FKcGdLpgfPmnKr74X7CagefPwEdrgDzlgAoBHhbAe+BxD9z0wK6frOsoPD/aUV1/OF2sL0PbV4D9fXi/Be3QW9IqLfBJ/KUakRoene/lHraDizEHW4gLYQE3oGDpj5bHNNF0+Y3JVpcdumxKuUyFsctHcLeUt6JhdIDXGgY0GnetfAoPjzgDpbR+CGfpbFN31ncGAwxqeZNKk7IDNju9TuCFIqgJ2m01EyBFkU70s56nSqYuLREDEIl2dEyyHJioJSAKAqlKu7Qivkh9UURMICKBTIEKJLmlMGYjS0vOpiMo+HjQk6nrHeOS1gELjThx46Opw1sRlaUig2moUsmlxwNoJO6YrFkwOSrp2ElVdrRbu/zFZLkk9aR1PBHxFyNp3REsB62PcN+jOJIGOA1oGa4NDsCVeHRegZwtvK1kRaNmtljYMh/G6zS2MC4SRkJIywAE4aiGIhUCAjgpkmXuu96DlDptUiemt5EBUGYFvXboqclqmxTEolhKSkQC9KY5s/LcZSATKwPZ8rPB6N4QbMX2hPlho0b+ts4f/l1yeSh5703bnz4yky4BrcFyDWYN6BvwzgagW8+nRPTxh92IWdFzfD6u++WDApwPXb2e0ttLGheXNG4u2f5qCtdtcHsD7P4mXPeeIPGJK62gW9CjfcsaToG7HngTn/bvk1Zmp1ALk7SqsuiUm8hNUNhTNk6yKH+0XJgcoTCaz9O14hFwBirEZmauMgboMgP1usl0rm8Bg4I1eRrg0LfY0aNJtXeKgzUVFdJWILRCQTP1ZCWYlx1gIA0mAKEBAhEJhJ32hHeUA2CR+VVjTI1ZfAMBU0zz5CIruBbe+pGeF02nTTST5/DmOoJjUGDJI3yBmjClrVjiN7yvseWFmlH6pkYiqhnV/gJHxif8iVirh5bcpdwi7lDOWBV03FEj6kBN1i3UCusCly3XxLpoWqwFTIGpNlOxXnKmoulkrZ21CP/0GyOFTtactlgHdandT2qgA8nsJMqzFYQEYaOFKoKC8sEgAEEiQSDih/vKofYkTGh1RGezY//jWROT3M55LC6MLgtPjT5I4WCyMiNKE1MZQRmrZevRlJuCHjZsAnASC1V6oQrY3iAn1YDVmF6mvka+/T0t9LQltU69Chm6HpLtjeViB6kwBEgQZr4ao+hxiEanloAlMfoCuG6AnkH9z7Gd/picnmo5moHDE40HMzMtj4HOXtFful7m3z7NtZ++lrXFs+6Z/ne/zOR6O+VvBvhhJbgZgjqy/dWEfrKpnH9E4/qvIdZT1V2fvukz9wMt3gdtohFPq6J/7rSq0YI4z4mNbHERtDELS0qVNKjNqmxRG6AarlJEOZJ4zz69/FwmjByBa+SpcMAjpYGQ6Je5w3KTzosByabJrT+SgdPQ179ItbsUEzUBcvpDTbLRv5pUkrngyTNAqktRDvsStKN9R1sCoqBqAplZlkBAcrgj12qDMnti0DfBg3E96QAPRUf5O+Uw5UfJ1pS1lB9KjiVf4V3kU8glyGrIBuTrwq0GBoPR6CwiCmKBaMKBuDTHj/tBcILDIQ5xsVhZi+KsCun1Lpu+JS0MWavWemvU2utMd8z0qt6ruRZ/Rxt62tTBD25DRxtGa24EXxTVg5Xl1GMVwapkiYiiQur3TKLALEeo5JelutBZMB3TWD5ckoOl7X49aDNlV6Kd2MBrwPeyYxitdKdHo0fivThovMGMcTGyo/Obm63tYdwh61CIgsPh7SBdOzbmmCqTgrMkXx976Xrarn+xSa9cn1G6LZ9JJkPa4D9sc3GUWIjGKoKQJgkQDcCALOchbmi6paU7gfs13dcaqzW8vEc99+vKvVvio2Nweg7KOfA5eL4Gn20Bcr2c8qgA5wNwPQC3I/B4A9x8yMbF83axH8O7DS3DKzIPf15jGDL34MG5y52mhrlUgwIJTm7JhrOzS0cTI5LGypVUgMqclKesdkniydQ8SRsrR4hH4VTnMVEJWAFpKliLms0fWSn1YOg1WdtcrHm0W9/tBtOUbnaw3KAFqw5EUhAK8bsvBAqAdlXrAgIgMGnB+LXSPikHYOKbMlTRBmWoodpiLw0miJdAs0AUj+JkuclFcLxk3U0Eje0W4yWM15IjuaLf6ZfvKnkj5bHzJudNopGuwTA3YzUo0zCoJqZa1FyWjRgsGGggBYAXcGsEJM4sZJcdgEiykkHevsMzTd5YMXSwVtG0rNv5w9Qjpbv8llKTVBKrCSmnHoW0b1I5pRc7e3lIO1meVAJbYKHYZeJsSPKXevPu2xAb8EQQJfcmmOhhBLpN1XSboYCGAGG53FgMBEj+MpscZIb6spdAIzlNKTTFM8B9x9PqM/Z2XW5aDDttu7vbIhryuwmmgjce3K27bkEBwiANQlQItUal0iuT7kxqCT0L6jkuvWlId9QLsXLKVGORUhVsa5SEU6MmITHZjTQys7SNFncEcmz7w9913cE9mRdn5ORM2uyCubrJPHobcXgOThbgdPG+Ta5XU/5PgAhQAjwrwaZE+kjLzeO2bPbAzY7q5gpY/1X1/htapqQHzLHU6n3QwOZ7gczQebYHFUEiHMY1l4jFhHJp4pMqtqQ0Qe0E5aqqLYmPpjqzeJhUlyLuyMOWJpgCQ8x7+ChSs6S7tBarNUfpNNKaky598ia1OFh2ZdldjebCWd5Bo4GAeQha2DffZiMpA8qk+CItSfxEjC/LnomHxDM4STwIHIoXpdCSQ8hHl59pHGGkmcZTmRAMc9qW7nLROWpgJB0nqqzswdkD7Va1oGRPsggA2bdIM0mwK+Dk2v78fJMQdi4aNmlbA+XSEXAVqMBRDus0wULhMIoKWEkbyeFm4ECmIntW3Rr7VBYodIMTZ+VePs6XVcgOrwFQ0TZ5mYxO4Kze7Ma0saP87O229GMYOGnWLmj9FHq9STdDyiabw5uQmbcipLswCSawQpQKUdAbVQkE7XmRoBok8+0KCvYVRRqLO9jl2zvl5TLntMVpyHGCO3FL5+0X+WExsTdb590luBva0VgavAANet7RNtCpGagIklQIeZfOQ89xk1nTwML0+qGnkUwPA0qZWlTn0ursgIeReUojE5KipUGWYEkNaTS6llmSFHQHHH3P1dX/IQ8egcNDMx49IAd3gC/AaQdOOlA7kBMg15Mpny3ATQmWI9XdVtJdXpJ8a4ft8Q2Nx38PbJ92sS/p2gd1Dx4vuepIpeFIBLC86B1Ac+qAJEmBmuEziB1KNNUpqTRWO0J1SCoTq1yycmdqYjHGmjgl0kBaQ4OZ2Yx2iaXSp8Pahdtw7jY2u/Xpzlpd2UtITWAVUlEQZjWqC5UCpGoESMvzd0T7EqwAKAdLKNMCloZMAxu/BFF0Bqyl9UyGc1rKN/AljPab/LQaMTc8hi0BQ0PZNhl3UzxOVEXNK5J7nXJpBUAYwUhDlYIKB5/7gmS+1QYEEQrpiKlWgWnHQRDURQJysDg8eS3sJlhhbJIWxHgSIBSeGPAJYCAR2g06nAy6jngZv49I1ZtKPl7tEyyGUkxa1efKHfXD7Ob2U1M6TV4O2DprcZda7waWsL67OoNp8LgbVEp7kyIokbJBBaiSKFIlQIgcNQZcFnavLCxL5EsQLDb95ZZoL14rU/7NHOQ6OZ68WnhcObhwbszwwVyk4f6622IbB44GeQc0SwQgMDqoZmgoNqoxfb30L9Pg0qSPU6YLX/ngdLATWLnJkGTHRIAViEGUtGq1gDofJFA+VXX7ruvWwaVbI4/2wfF/o158n9w7pU9n4PQEzC/AYb1zPZgSBfiuAbgbO84vaT77HOP8BfBsrLrZeP80drtg9yUN7Hy5+2ADBuMgLI4o8EE6XBomnorKtFedSTGh3Fg/WeXi4kOn3JFqQpyTmpm1CM9sxnsgggG+3EwtrjQsXG05d/WVyDx/hicvKG+Iw2Meq8KxS0SFEGI689V9GIm9GB8BLfFDaWEQGxmUaICuxaNxHF6/ECVnh1yFiTaN9OGCebpQZduhjKdGS6is3hBjQdWhHBVjjWJNoGZAHXxAeQeN4OTcggBEpGPiF4KB73MC/1smLwyLJDAi8ig2mRfpSECSw4kS4silzCt10BoqdMxCWb2ssEA0idtfxD5pF9ooi8yiQyuURlqJAnuVK7SuOn7p8VZCAiuvdWk3c1qk6Mpl7xSRF3KSF6JEjAS/qH3szkvp8W4Lbje47aDT5gqlgH3J2DRwEtYew6bYnT6m/oOkqrEPkyJZs7OisbhIFVB0x0jFdG73JRAjgGAkYINWI5CW29AbaYQjHknPjRdCg+PhPX19cUFDF737zv3aqwvb0kztacZEezETEqqK5ctOdWaQpf8E+k9KepEKs8kvkvwE2Uwi1F8syrQSM4VhSpMWkkolaI7/x9W8gMofuFg8pM/m0p47Z95bmPm59xAv/RHoDsA0B+9YTq7PqrIrbsl/qrrR8ihKD+yG4PHj6ic30v7mui27fyJt8wXJdcJrYBcuWqi8JIhTL5rXNHtdBEzGpYuLinHVRvoLK52hNItKJOWxKQ9ZdRS1Q/VXumBni8m7QYk2MjycbJIjHK6+OnTk/Vzu5lJ0bTLFGTGrwC1Svn2yASTT8hcAxTe1ogTGVDtgZfXKR2oEKOChFJzy1rjlpFBkQuGSfndJgq3bmy1IE8no7RmVzt53VIlK2Qug1kpRACWSe1BFglt3g0HQDsSIH4kEB6VebAfSDsqhHzOLlNvGNzsWfQLpBEfd7pjxYVtMp8daibQdFiG4KwtGsZM1nUZcrlRlDyd72g04uWoZ52LRcukmYEV2VBPxRaLET/xW1GAjEb/S0qm0VnWSh7OlDlVqmYUrpxe8ZXJPN5kFnLYs526mjZk2TIu+SqkY0EuDvKtRmdBcPVpFo90IOckucvSgVH1pB6W2TvIR7lx0c8l1VKjBm1fudPJF8a0bv754Ff/sQcOrCW/YFojhcdtX3gPScCJ7Tsrkt9mfXe4l6VmE7tJkl67bRUYhjMoUEZiFLZEUt9vmhyY9SQ3RNKOmakHLSbhu9YbG8X+iX3w/3B/dRz2+DY4Wx76yVf81WhfSXv83/79ucn2U8tfi5eJPeCb5OyVYj8Dlblof79GPd1UX28ibP6tx9zlVG2rUK2baThEtlaapmCaI+AA0gxOxrtLWJE2Uxb7ichPF2qseXPWsKudQGkalvkiyspmpyXmQkBbMzIjIzKywYL3rld5bduiyWr1m+eWdKBj7IFUEA5mdRVEj8kXapYX51oIYEF3FpBmQaDPTZRfFi8KpcRuTtWGCNBLNqMol62koaGSC0al4c4fzRMMFzUJR5htCAKwAhEiKgQg7UJUWgKJAOmFDFiWq+KEEYooS7pOqz6kYrAVRZP5RYsqmXTL1QBU56sL1mbcAfLfXjUVwUjgXwct7UfiQTb719YXX6KdjkitPTdy1KpVHMnfErMfLR2MXAlqEJMT7srpAwGJoJEh8BqBRSeLlKNhX2Zcc8NkCRtkX+ccW/WvKANNaRhmvke8LJuJ+slNJ96nvyPSfhjOvh7XWDbSm73BQdeIY2A2y6SqRUkMwVhVrTseAJMttCcTMs4tMLd6gU3JzcjNxmZxEblnp4sZjte0QttzDJWE2azc+BjgklCEI01BA8EKSkZIEHeQC8r3r3qrCVZOrk66SZSvkm4g6FgjCSZgmmpKaLZIQdo8JVxc0ypyZHtL9EnH8tsbZz0q7vy/t6Ig+moH5MVicg++swW83ub5J+Uwf0ADUgWM9cfWNDcnvu648+ZqL8SnlakLqWOUvE3tSmWyCp4DgVMWowxNw6dzFJCNUZyhNoXppiikqU1Y7kNIkSlnETxvlrhcXcBlcTX6Bf8gjWAB0O7uS2ZX7rPezonDtCjTcOCzCB2BmaM2YKezw97iu0drlL7ev2jnTetxeEzDoe+5meEPPxAHlAGMqF4Lut3x1YQRnaPjwCIayB+CoOgz314uxUl2oUtJAlLukJCL7ZF/EJmL23BoEIRUw2lNgypHIG1GhTqu6sm9xKhR2wYBdWGGXl0GnonN5a53Tsm4KGIGF64/VqtSFRlSBPbXKJlivVK/GTNszXdXb0lWaAqaa8qU12une9VppA11gI3RF6801aizk2Jm13fwuNGo2hIXEH9s2cZNqbME+m6gsstRhg3JjaGQyaqkP4m7v7mtrIy7VMYiqLHeM2ReBCBBMGLeEvci+VtQKmCWSTovC3GGeOFf1daLI6CQo+du/4AUdnclrHaSBFkBHZtAPZ/PqDNKmGX5TVqYfyztIDUmFPPsYGiBMsy2V+u0iwIKCZSm1IcJzvn/vyXOBSRwvztzl64l7Q6Pb7oLhcEG5u4iHggeqxhodwt1zpfWQgxRZiVxvuhZQuGe9NYS3UGiTnMQfGEYRTiYaE5FgNlQCOAEHlZMtmdPo9l1JP4QOz6QdzMHBA3Lvj6Q99wE4m4HFHJzOgS4BmvVIypdKsO2By5Etl0+b9uw6fLmRlsstV9aXJNdPwXd/S9WuQnvLUBSgUVo01W6ztbEJ6Rhqo4kHqD6S8oGt3TeVHavOnWobFWtRPUI8OGsYmgsuZAkRMqfQk6xnLQ6/Sg69Et33InjRZOfqSw2SzC7N3va0tj8wBEGr40s1MDNFCPecEldxHPJ5cjx9siOpbG1hSDRMGIk0XrqHOSJ75+y9qFmifa3IUKVAggaJRJiEKoGIBG3Z18IKc53lOgQF9TDyxRjjL3pN+kUtynFOCVJACwqFrPz+lJUUnJXNrzTdNL02pA3SliyFT+/Pi1bAd1/0KfbEPukWzUhTHZpemQ5/VNZ5yLbG1/mT0FFGxsUuDta4Nu7us5nKTFSTkWlAHVda0nXX7jpjj1Yotz9xNMBCHXZgs2Vd02azRG/SkBuK+aEXGu2o+e28KPc7NsdCPxe22MhopOc9GrjhcIJ0QEThdqtKTSzCXh5bxihUSgtMUMIM8thpAInoFlAFFaql5SgoS1Blk/pqnUlSaRljfNN8nnbjtVRYg1pLT58GEgz26aybaU0zrUUYHDZ2obcNASRR4Y7Z6FQA0jUBYTkwItIJxCx6DbAlJjhWCgnyXv7qvLnIbczoXbp4DBfWYWu5qyzCq/qqfohDJhmDGLHQpFBCfity16FryfLLkF9CftjLkmSS5SYRoARBCwR5Eq/bhKup+3pAoVFmcP9LzLN3NB4cmXz+BDqaqQ4emXb8PjhdgLYGaNcHvXD8nrgu+7jxFzmemS8/XjyDLDccT/ZUj57UePavVOsvg8sC3pfQrqRr5aJu0uh9L76p8miqQ9qMTffXVfZQeoI1l6ayg/JDUn2f9b0ntTOp9MYmpKWQQZipOYvKsseqy51DKjl8OXPYlck/H+RuRKaH3zQYnfZEkslMmoC0WiM0HPBNiDDZ4yitlA0Lfg1OBqekPBfOodvWT0P9MIS0TWFrTcPJZNmpXZfaGjU3VAVoUAEjPBwBYFCeF2mb5ahjVgNp13eJQABIdC5AYIOgUS3VV4/WOwYlM1RTaiZ7IX0665fLYGclsK2kHKw82H1jH4V0FzIO1B4wpd8B2MFLO+Sk2+AtJ+4OugsP8dIEidApVDXcBkY1FTQcUKukA0wCBoGy6aIMbwWLY19ZAPgIWKpYvSxOiggfIE7iVgNHKpu0UiRHMEqr2qrmJ/ODNdl0TrWtrnOnBqr1pQeh+qEzFlJ/6wmD7FhykglNuTLlc8maGU9hPE95gDcJDZ2qoErTAIV9yw321AaQD4SjCyApiZFEgO7WOptIaCqBsJldYkoVc+21XgutCptze6PTTh8n6wxOs+G0ZTgtlU3D3Zpx8dtPTUbJkDurEhIIUkdQyxeEtHwJW5Wg9RPRKWmkN3Td6IHc0uV2JxPXdEIzR0d1YkwqY+UiuWJJkk2JlUAkIJsifyu6Fq5n47rW4jF0pSqYFKYQNiEmwaQ2AGSrdQXNrUrPtfS1eNYij1uNB6k6eUva4b+hXvrAtNNHN+XN85vxnd3R3E/DSU6u55E9A9cj8HgCLqfgjW3ljT3l6Quq7Vdd7L4A7x9DDJTqkUDu34NAaZrWQccmbqZ2EdUDVHZu3cWUD0XpQfR9gNoTKZ1Z9WjcqBSYDoZAlCBCIBfhkOgdfpsc+Qx6N1vRioSIN9tMYdcVp01BBAYPh+aGEd9aYhKNsLQNgnQiTdBa5M3knEZTGOZ0UYKLVIbGMAIqTKKmlZoXqhAV+iio0oxORSRQpSwgAAi+zLeMrIoxIj5GkUvrpqzuXGy1wMqj3onCHdlEPtkKKUm6pQGXnuOUXt+pNnC3ozQR4UknblEGuCw/XMrJsmQFvI0dYgURC5kjgaoATuCy/EQQsZejAEFIAAJvgbdQixkgAA7fSVxMAMEBJAAtkqOpj8JHnXHdXt5hcVg+EKUXGKpmA8/HaKTnBTvkm9gGHgBn2fPlccjtoIYODU+Eg+gNZGsaPVwMOWxtykSlAsWxTk8LjaQloDSFchTlVntwVGW3tOKSIEWCsqDSatACUCNoLAcNYcqMTrAcGPZOewA03xU243TBWaV/d/o53Xd/dS93pzWLwTJlDFLV1X6oFETh0ExjRwAU05FI2GgxaE29oPJ9eXIhJpfCtpkHf8x5covZHbNkfZ2yU/N3S2ZPyotUcHZGyU+er6H7JincVb2F5NdNAeh2J5skGsgvzMJk1vSAUQkkLnuSGgehmh+C/k/Ivd8L2otvgtMH4PAMnJ6Bg3Pw+gKgWY8jX0bUFc4n7M9Ub33cxeNrks+207q+zLbbIbtnXIkvqnwEV/tAIy3YaBSPMWuXDqR2htLJFY+m+qFYtzOlJ1U6h8qBlXehdiA6wigRYgaLcIBchkMndfgNO+JedH/EMteTQmOybKSph30vhJDmNMjUyOji1Phyc3G0xSQq5Ur2YNIGsUjWZTwdzm/DhYLzFoctIm8jMKyorqyxswdQxezYBRIKeHgEBkUIYEvChIexUS1iL+Y4CF4gYmR1IcJCu3SWFlUBG9AnaiZ7QWvqYrCWtTJreJJpDhkvag203lA7UXfH7aawDOw36IUsKS9EeBsV0vg3xTLTQMGy6finAnYQY0wnqCaLx4MgFkCs6TLkuJsCxDQN5PgYQr4IliEOxOPWUW5EgxjwLulNRFOd6asWfyL7DETiCB6Lk4ubDOyLmkXFhb1ZYVl5Y+duuhymQgGnllGkMaShPA1X2ubTSBvc2uC4sPcLChfN/5dVkfIhAZIftKQRyYpUomUxnepq9dRK2Tx+dXuD2YxfDIXlZPXT+hWdvoZzLJzJw7roUvNOqVFB6QMpCViDKgc7Iqbmy8HGmy6XT9ou2A7SWumoamUG70T/XNyqjW41s+PLXs3mPptmEtLIyuV2mwSw3iayt65nCb0L09O57tnlIgl7ElkJ7GyxJhLGbidOAWvHRKrSn0AH75DTffpkxnb/BDo7IC+/BuYH4KwGXQ3e2QLk+hj5Q5gIJik7U5zd8RnrzinK5b+mb55VbQLeFVqsVE0lMwYAoTQaRrMFGlgFe2GVqaqcQvkhKe1D31FVHkT1gfU9TYpvq+pEYAWR6W2mKQmW64pDP4Gr3swd9ox1XW9kVyY7E7HYAIyZwgUX+9HlVtOfBYelUT/3+zgph3h9aiJVFesKK87u1ss7r3D0ZuvQ6Omk7/LkuVTk1pkGQGY6tehnrUaJOUENowBhSr69VFIxDquaBUh+0Kq3xQTeAriTFA79cRjMbuPUrFvK2qlYyxew2DlnB93ssAuYJtUeUkHKRCWnZF64q2PqRqpUhSJNhQdakU6pjpW2C3uog0QWASYIRIL2W5fE7FpxyLTnhDiwpOuwJlDEk8IDzvVIPMSEmFDgCqfFPMQYg6jAd3DHv2U0gc4pabUiWfS8LCZ/gJL2ogEey5+pYEPBQIdQOaPR0cGoYfX2rEvnbU6y+7BVw6tfHDYv7zavHuRDcCRrJ/bBWWNAGQgw7LIDIfMrVEQ4UV2WTRQIkCoiYh5h2BxAJFhFkHZTWHTZE/KebM5+VN7rCU5raf3dlYViR7CrsyrdpdSY+CQYtY8fxCg6mXrgqvHDj94WNuTSVJdz6TmJL72TDuRmx0u3URNn8m48jgtcJ+ZIYtJkpiK37qxem8IL1tVNclehZw75oQm7LErxcxiRWXEGU04oXP/3TG1N6zroNDVOD9Sn/9bVs9eC+cUD+uwekHPQrwDl5HqX6MdgZlvQbKldp3Yqp06UnduU1al2lhOy/RBdJ9BImZDGD6sbKwq2kE6hMlSVPevfmb4zKz7A91p5VH0nVj5PyscR5p4oua0IfsQcRf4uOewHyRFfhCO/mBReVcGWhBP7ms0MV+xqI4F2XkP5R3L+ed5riG+GmVgRDK6mQ7XCqn1TncPRa7jV8drRuJOdWKnopOyDsUZDlTp1wPRUEQnLwCJziwYFbRBIx4egSOLkYPk2ryH2u7etytSTzzLHw8ZEZ86vNuwPdPzCeb7j9uAeHRSdJUrBKIptlC6rVHEq0l624Y7owFxUb1fnO8vtXfMijWRqn4gEhg1E7hARMUIltNqru4LHa9Iit2YJfwxMgrEPMEJTB6+wcKRxG6I0gQjd1k5C7DmaBPDGhDhx3X3LIeZDi0u4VvxI2EvLF4lkX+mglAwzJYfvMLsqbjb5bsg2N3kL2RxcKzh33zl1aOx9M/DVwto1eafhcBfa7qLmMLy8GO0bZ3/juQF1qV2jotA8PQxD2GV74puDAmagTGJ2LVA4uTJYfQoWYJRVYz5GgKFo8quSPdnAaTpnUc69mF58pHUcrHlDNZAWdjRWpWeDS6Mhgaw2F8/TAjMLtnPpokl7SDpiW4jLnH2YOeksbqi924xVMSfhae6hXCaNnc9gnElmTgq1U3hWrbqaZF9A72S6Q3SPLl8z0wkWIpZEisunafb10AXUrWxZ/ETj4ITt9E4w3ftZxis3weEBKMfgtRlAsz5FfgjHs0y7onVtp9Fez87W2vX7GnPhXGX/RG1Zh1xrp12DgBgwI1UWmkEDHI2zsc1UB1M7Jf0H0/dk+j6I/h0rvS7Kh1A6NulEdFBMYZpoM0lYxBGbuav/kB35Syz62Ul+Y3IdGAMjmInN7wLEe39ec2GHb/oZ2zFNYslqHdQMleid3MytYu9m3johmRtngkPnvdRgMlcfwMRd87W4sbBakzkRkeh1v2VMit661oqQ5hvKmJzFkDt2PWVz7kAvNr438MQN5KDaN5heFdY7aDaKO/IAS/mCSdC8K8YoU201EaiYAA12AkFk79HFRC4dUIFWtJxAFEBKlm+93QSyazWoL4rIweXfgCxLAGVwkpXcpKk7SuOS0RQ36TlvgS+zyCly8Eqyo1Z8ozUZl2v5wPem4vIokD2n1KoYA2OcU5YK1I9MLlcTEZFFKhIAaV72Lfq75nUj/tHDn2AFVFo6EXKqOD25HnJN8MaA88Lar6z7Bg+E4wPeO30o2VrOfyKvvHz2akfBrasfZmpH6a0BGgphTKuN6AXzjfpHiTDlgJPUP8b5cr0j1VLRa9zH0ebknpk7nfIXOzqeXrTZvcxy8aJb6h0ANVhBFrvr4hmpLo92gPG+ferwFXYRkiU4lM6QNrBHUbs871aYV3r/2LE1JAsRDKxzmSj5LIKiTBX5Aj0r1XU/Wd2bnuvQvcoyVyyzJhknf7ZIDY9eMLcD7kDzGSi/5crhfeSDm8Yvv4Z87k4lZZbGqq7SLY+4UP26rxcR6Mje06H14oHlKeY78MdGuc+vKOdXcbCJcAvaU2OKkJM1mhRdyhmsnMMkaWrnUN1B8WDW7VnlQa17NJW9Ku2SykNILszZqcV9Bs3QkKNz5LY44ueKVT93rfDS5V+R3IK9Hga24d6nHQBh6oCHoX2ADq1RKHkPLSKZWWXByhVOXMDxHtxslfV/GK1rQZ4ymVVwYRdLMwgxRdwQLaIgavtAmFow1YZAgC/VBGncFpxu5/aTPR7Wyq3rTgaO3JpcBjdXVn6mFm/geAPNkIqDnUUZWXS2mrdSFR42s4dd4sBE0jpqJtnLThERI4EkIkHUikRa5WCXLNeXRSQQWZSoJQflqEir7cQhzltInFmxfKIU3jEGh+DiInQycXewAkfF5UUmrpvJ0dYYwMc4JPhJqWFa7boYCaQqIuIn82ahUbzu+OLCIihoJ6CwpSt3TAVuBqdNLgfXyTWjx6T2K/v+AvYX3pAm0G2zsjm7rW0awmaYGwfGGhf2YWHNE83FNJAG0QBKMXnKFMIs/wZ2lKorwbQx089pAZxOjdfBJ6nP73qOhk2n8hL5cG8t1u93yKCGzi4GTCb8/PSCbx8YaTW/n83Abf4Ua5vEDsIdi77M1r4hN542blUntSrMnKgIJViYmZVJFlWW71T3HeR/OOq+aXqeh66bJL/KcjVkLS7QKuYunhNr54QVLcmc31QdfMvkvXednnskvHKM+ewQefYA/fwR0BX4aDu5/kM+TVhOcWapdp3ZDPPr2TK5U5bLWqlGbAgtU22H6xZ7ThY6QTK4yuT6P5h1O1d8VOseitL7prSD4tE8HjtDcFGIYOZgnOVKcsTd3JE/hcN/yLp/btC9cdKF/cbq0kvOm/BDW1sLLRqGtKif+MGkk3lDylWUBMevwq08eaKlc4Y9fAkkk5mYiUkjY5JuesJf0rziipJI1JrRnkSWpf7khpfJ7RM3u8H27EXfPrj3MK07PqTWd3zywjl9Y9kOlwdC6VrFIQUYDh3d7TUSsaWHAyEydb8VSYsd5iWQ6/xFiVqRXKojYurSKtdbYuotE0hLJGhF++a/1gAeKIixUtYCsibCo8FbuFQQcPmiO1IRicxCdYcxC359NREJTPnw3kAk8mXBl2qwnCw3pNSKJNAO31q3KdoKyGg4XUQfgPeGhye8O8nKXILd5rJ79dNy0ergyPXcrVI78NVUpqo3M4GCVh4OkRIxYsQklZYJ2JpprzHTzsJ9a/UZWeeHs5aHF1/e3XtoeuuQPybRLMKZSWNji2MHRqZ8a3lh0VXYbDv4VNOO2bmTnrN1u+SWpTn6aXC8wc4mXbDTvlrTmMCkiqCywr1Y9Yys/qQqfBp6b0XPiuWXSdQTBgsmsgQoL5gDsgS0z5QLM89WGse1xkst/PzvCmf/l3717vv+0rCtJ9dryE743SqcH5f7v+3WvzbL7F1KZidY2+MVuUyRdjHbJOKGKFyFyinUhkiOTWnHinvW/9is/cCKb0P/AyseSO3iMMBehDrPJLAT3etw2KfFVX8WjvjZKvfKPJ2nLMl2iUWz6S9WAgTzI95v2OFgVkkS7MGU1DmZcJO6dcvL6KQG6ZGFl44Z1Wlve3NmaUt7irCpxdbw6Pi+quwsR8vtj9BrU+B2Xe+4WX+f1p/KaethYDXZJ28w36Af7BxsUqY6C6RI/2KU2S4SNB4uL6izwa4kMoGItII7IAoSpNI2t+0Kdkk7SsRUW/Xlekdkb2BEBASLxaSVvPm+ViKRfG1uAZQaKdKJcwWvnltJ8JM3bycQ1E52mVa9ZSSQoGpOzrzAyKWDAy0JWg0R8akW6SxPrcpB7WXZS8XJUz6XvDXZRcNxYr83sAl632XvzKsc37za0WG8nv3e7END1diDscYSt9QEez8D09wVV8JK4ptg7+ojVh//XVmdcVty25R+Mp3V3VwfcvWLOeQUArGmRCYpPoCFVst3mn7a/y2P/m/5IJ3CB/mB1sal4nt3kyZulZM1rmo1MZMh7IIlAzEly3Ws9ybp/WlY9Sl0v3RdG9O1glwkUSlQ2M9Cw/gGmAST+tNdOQ4Xx2/S8mum3f8T8uK79IND8GAOZnOgy99uPYVA+NOgVbknTZh/ltQ/j4/21+Kjg1Xsn4ruDrTL1mzQMMx9NRNLGh1mmxt873S/gL53sPaRFHeq+Kbqf2Lli3EXdVuazQapsgu16io79FN2xM/A6h+znvtBZhFMBDppf4itVueVN96CCJJss6ikhJpFf3SOW1YnTnB0Nsf2VXWf4KyCC5iJSXNmgll/wXKr5cf8lG/deaF1sc7AyZS0wT6dUl+UNV23xtO6Ogz47l+TPnuT4SfY33EfvrlWbSw1KsTcg4LlndKIOgZQAkmK0hERQRURkX0CgsUEA3QWX4J6ICKJiJHASCBi5NK+iMi+efnazgKQInc4Mnn1FB+9DUl8SeZbIi0xP5ZlSaS+LPVluezVel1Wl6UhjaK05yN2WQ78F0R1ASVk0Q5OXzxLroOTi5MF57PUG5PVWXbvxg5mW4FtZdqydFu7qbA52PszqvTwe6JGY2fSMCYQs1LhJCW/9TimWd3uNq5653hrfr6rlOaqYa42qsPeTbRCmJlJJRZTIAAz4Zu+ef7yvnQRhh0k6ZVNkuw6axo5ZmhuczDHrifVM9CqfcDMQtSEoQqbTvcXYdXnrPd51XUTCnesq2OZRS9CiCgpAoQk2wESoB0sM3r5G+Tem+Cl++CFfej0A8l7d0G6ALMGWLdz/cNX5d/65+MD+L/+7ni//n/WgDHxmj+6wvz962y/92m2zz/CeNthn33AfYiKfcCsd04BEJrgenAYcmEmZhpBGRvMsK3OPxwXHObWE2PhTKhclNJIM5W/VCfvwF1u8Olv2e5y3enEvVmfP6vimsIgA0qvjHVroCBuvzJtg4V63r7ObYvTBUvj4a+cXulb9ZB7tf31bnKp0+tqqSYMtZ7VJKzQ95mF4zhFJDK74t6yf/+1/OzD8mc94vkXPecjf+GLXv+sJ775zAP/ru5+W92zn71rP3PZN67PVO3pZsfLpkJtXo9dJbPkkzUEB6hCsIgBI+Bl53TztAPmMlMWKhcNaaKwcATDDUcZa8pZhUZaZsQCWtJlFChdB8kd+quZqz95x3B1ZKFBkFpHVYXQhTruRoqMn/IhlnXupHnfzHPedIfzfvO85/9TO2zR2qzWrqI+FzZ35z6PBz68Puz57ew3Mb8cdq3P0muOJPOa6CsZhQ8RSTqYWrtGRtgiRZthU0SkyCN7u7LRfbrrOz+9w4/X6VecT97uTT3PdabZqteLL5muObQ4XI9c01GDjJw2o9GvhdW+fXm+4KWrvrxwEJypeEqfVbDKNIVisofO2To9G5fOA60G3zJEBlBBteJ5CARbAOwdKlag4zr7fC/b/UOgt47CX2f3CrXEm/9ys16/pPxP6xuY/3kPkGPA5322ry+x/dZbmD98mu3TNdDtTezjfcDsgRJbQgVm0J400xeZRZiYwniYIa5GZxmZKbuDUSvbl2i3Wk2lUa3VZtvatKNOvyjveuvl1FtOmy8+bJ5uMyNVAwe14roVK6INC6cE6/ZWCwM21ufty+3CM5dzT80Pf2596MN64KOXrW/EbHM1o1Z3GSBrUgUNtakAxoiEUkQ5dBqNpSHaCN0bW2bq1Eumv+JV+Yuef3/msf/9u2/+31tX//nMcT53s5+58+Wn7nr96cuXWQjGz//5/OWqlXOwVNkAYpUTmjqZtylTpy44IApelbmWjm6k91J0AaCLClALhWlBuwqqosJZaV1mhCwtl5vGjgJDCB09ddO7dwBJU4uDY2fUSfOukoqgiRFN0CWC2/0cHIlyRHVu31ov2ly3b0V92GuD29n+Tq/eLZzZP+pQPeDR7cFPP59/TGp1nm3aUKNIPlTcctn1Ggy1mBdGNLKjL5F1TQQvuZCt0X48/Yb1ue96er63H0+5AJt7/inOtjFTNRXKpw4HDFyy4HXeW7Q1pfu7tauyafmA85SfilsAKmk32oSZvrTcaPIH0XcnLuj1C00DtTxDqXDnSIiQDUFVBagdJPdIx5TtuAd8W3tpextwpDSroSmvyjyeMd7WATTrD5gIwL9Vznv6se7bj/7au8/7fzLAN+/U6YdrXr69G/H2DdA+Zsvy9AXQjCfNehC3DDkrw50ZHWBbORuuYWIPw4CJqfFqoSJa1srZVs1OxmnntTPecT7j7tPJl102zc6m4zeq4VogVoTTlAXaINGOUaOJaNh3rOa209tFK7szD/PMp+qVvnl41DOz2tjPavlQBhpTYx+UeGlORAQr64RGcVRkXfv3ysDiRntsnrp6sffged+7bL7kEI38bpvfz4///cxd/tSdH/rczdf6mNmou+47R423Pzz/4cdXIUdubiOhFBvPZObd+www04CUD120nAeE0NZROh5GMc8W51CTLDUlAPNGXDAC5plmvKRbqOvc0jrw+x8WOlLXs3CXnVtRBHbzRNAnNYrO6NnAIa1NuaUKzkFERXgh14XhOt/PizYvF671uc3PN9ZfzJy5Pv/V+ZUeeHo///Bh+/Fez/1MhkkYVANKcPs06Gk1UbLDW6DQU5RHeY21dETD3uZ1YeK75/r46SU/HPe49Ph/2TQStYr1Cnca6VrBaeTWrn3WgIyoM+r0kDka1h03fSdNYUqjJp8NE7Q3e2admbIDFfYnbm1gIJ3MPm6LXQEZuqoAghDMd1oE1mXgeAdb3IWGhcZ+iMYt4VUiWllWcSRHUeCduX6A+SkA/3kP0KaA768A/vwG4Hdvus337wa8fpv9uAyIAdvYBUU52dnpueKLzPshuw+jRbYkGinN+ORGpjAmKBwaqIaqUA1KMtvS5t152mV113vWe731eNK+8ZPMK5PUocGxGMGJUnygX97Ofu1Yw86t6awTuO99+Sp/v57zGGz/bk760DWkiWkNjHNVeGvLQpu20uMkiUDLD8tvjirHzZN597ddPd8N46773p5/7nd27P6EEW+YXDZPXG/q7ObZqme2/MO9V43VYTLZqMXXuz5sstwFFE99VRQOsxCZ01SexR9i+sEOEjXZz/fwxiigy4wWYG1uusjVI9iYPAPm5qaM0cDNDdw2FVfqtIubXqTmaAEJUCikOkIHNWnvxnmW25VDgCkyl4Q4d1qb6HbeQHeoKceuwIoP1DKmG7Q0wMB6XKaFC1af5vtjfp07tjzbf3nRwdsHPzq//L0Pj3oiGv2rmSY26tooTLKfW+NGtEGXFcI1+XCvtiyMxNc4zzajT/f4yMO7+ITvfQ02dD/VxZnOUis0UHrOhRUHyby2iqIqWQ49i7JxOd3rqOtJJyMHyEXCWoQJqKABuZKcG+fWzu27L10H6UZe+2lshKwUdvP0zwHAhUbsOQ3PYd7PQSxEXWlYRZ6+A7IGxy1Argdg/mEN+L19r/l8iPV//zj7H30V9f3Ea28TwLgMmG9ixgCYvmIQQhvpKK6XXJMmpjIcMlQWw4cwUrpttUwwebNgODWTVRpL05oNndYuTnvb493uWE+9eMxMuhYc+HEqu2FiQUcRCi1sxfwWvrVbz+D+38H7+uz5YU/KrF7NNr1G63yo63IVbaKycmzA2p9sePxrWRyV6HS1tSO37YpT98wveQdf8L258fL7aOS9rU4zk/iXmCirVgMqMZnOyszU8whBv/JYzlWLiKqNb6VdmCVloG60ZiHgNBewnLgKzR7gFaAwW3t7a2GWUCdLjDg3bTN4ahuNeGNCM1vkxtzcwDGhmcGiRgBnNOfCo9lNekYksbCH+SxVKQ3YVcltbYK4RU8to/ldsAoKwpraUBoNEYirvJjmlkhPHvuiQQ0HC3XNb6Kxztrmlcov9emvLnyeL3fvN+/zO+/Ofa02Ni+2aLGkcqsahg4NvVcRrbY1ZN9hC1XgpjePHDpiB+tFrae5cz+9009uL/Heo6q8pcKWiXm2201I49gXChhBNhR0QwiauDF4AhtyOrc/6a0X23aTg6KiVCCccY0mBnKuig7DHbkEzqQbo+qOTKGzB0UBSqxCX7L1mX6i1cbk7jkwvQxhQJcDcLAGqRHe3g7uKdcF+FQFugHg3gf84YFOf+F+r/nmHYzvvwG4fR14C9AGKYyIRWDRadIq3ghZ0XALo7PbShmZVtv2MjoP+RDaGzZAI5Jk7mW9wWkn5vQnu41rOGEnv4KmDKN+JZ2xIvf6A/k4SkS57Fz39g3tOItHHsD7+JvDfb82NRbvZpv2GzdAF67IgZYOWWu3DmvCwsFVvnyTf5ip2Wi0Q55p+4Vvq+d7337uoreq+xiNfjPTyxPmrjZNqd6hVnRqRN011gJw8ve/cl/1mIyABEuuShXqom7KvXc+qHMFg+wL9A7UlWYIEEqdCLjlNJrT1DFJw2FswzUnWQRuMSOgIKiYo25CbgigMF4AMoKBL0p0kk/a6OgZUjems8LpZjuqiUyOqTjaWcXQ/f3uJErmby6IOzXTisZweV2xylyrW7KBG3m4aGvbvsILlmez8XLDypv68vV5B65e5ivfvOLDTzuX705gnlVcFhnaNPIYh4JjLcdhoDKKIyhaw44EO3M+9c637/gn6l5XP9SrNtfCN75e9cugbqJ2GyENq5onWbGjbpdpdoOn5oy7adRofJ6wEnvSXiCIaypokR+E7gi8AZ9Ig9c14GCJ2CwAFRqERNBWENsxiSeZ+izU5mmpN13xDclY07kGVyFcMnyoG7R74fhzxTPE6wG+1Af3p+DTe87ij6/r9P0NrJ/fgtq/wL69mS2HqAA4wmcmrwlPztc0Xsr41P1DR4cyXM2QZKKIO7t3oOakarJrMyDasKLTH6SNxzK4mNJcKZQaNMTy+sApK6QD/8dZyKmxUhcuxoWn5kccvDzgvnrgvbzwtW7WpxphpJorV+KduUv7JugtsKmrRYVblr7T1WDdsKPOuGl/xtV52vlP5pyPtckP9fF1ZsRz3Wmu02ul1SSrDE8XLUwHlznP2H2CfAIjNYGRQil1cgyg1VUAOpp10/fsGj1NVQGELC1e86wNRpZVAVkEgtYasIDoKBF3A1RwJ8tF3BFQYbGnUspBSFC4qiPuYMApdyMGR2lR3c/g9F2VptG5IlRYYa1wl+WiTKOgbLEhXlkqYkReF4a5s9aFa+v8RtSW99Gp6YLDt498aXro0zpr/+WCY5xtdnOK8hnVY/s6Qqk8SL9oSe+Ipb32QlVm1+Pd3355oQ/eP//b+wkTpxmz1ul7UMXUKz5QyiiJKNKMBUd9Si1K7wMZPDKkZnwueSSMBpXYZZdby8TBebcG76XgjRcTMBAdJvpxJSNAABw0AQ5qK1VMxeMXpa0vXBlmSi1kphVitShylS8Vb3h6+LhBOeUTPfCpAfjE1JZ/u6NMT6pf+hin50uAMWbGFMEbbGPEFgAMiMEjfJ7ZXCYOYVjdtlpGSjcydiPl8EfTdUWlUBh7kjRpbTKnncgZx5uNa9frZEtCCqEi2oCpEpWhcM+iRtPmV7H1TD//bDv3Jb/yw+uDv9YvPNzsRq+FDDRmDSyvrZZr+e6qh00+WZkR8cdZIHW3zriUz38rT779+aQd72tTRzN7+jfPdNqf4PjAo9FaYcnEeSxoawx0BK1jaI+gDl5TyU9p5nxVBRCaAT45EMKu3/UsrOMePcwUVLUlCe261JKeQMCjJKfV0FEFBQVBAUMXdKUFUECXEEBzRJRmKAWQ4ZRO3jFv7ZgKfqeSlSuBEOp6DwcKJwMXj4fdUEQgEpxoFDqGKK2MdTVIC4ZRXY0hov620J+j5ReNM7uth/or3u+Xv/fprFdypr/bzIs54WqRCV4HQ6+19v5HKlEooiG99nZWs+Nwl5seX+Kj2/Peetwy27AGEnVRtBcoJhChkENgANZRApthoDenn8hppXFryE6kqxid3Ove6UyUGxqeGjUV1xsvOWmVBGMhhEGR+4YBVcBH0LCvWJ+uz4mn2tVyInnbixjyBpw0v93gm/K5AvjQxT/aUn1pT23Pi88q6KU1YlWjtj77TNAMNoGYcfdxxyhr0+hktgUNCYaLGZma0QBnLzCZSXSXnmSg0PqF2/gYNq2GwUXqYWdPEFGFqA40WatUokKjqG4LfW8/gwvOtrNf9f0eiQfcNx7xTJrVuzl6zTSiwvl1k4k1erieglfllijn8WVbZnTGVe2577icdsVTdN696r6ba61zo/PmsV19lDr8/npo2QY7B9qhbGNBbsiicFDXkdAWSi5gB1QAHFWOtDqQqtLXDa0Jb6OOggBS2WxKU1vSBXRB62iMxtLq0S0BCpCU1tuaHZ1CgYQmZbFgGSRCJjV0gyhCAhj3s7k+BL0LAOSogMo4AxTkburieBU3zen1ghXCMzBSnbjEGpE9jTRs1sLwsnOYO5ej0X8xs/Fyx5H9Wc/zlR7UAx857DjG2byaKXN6nUwKkraxrUlWRlZkDCzzwR266N33Z7z9WTdpYNFwHjxfgMn+o20JVmJDYSiKmodJbEo6l8H1am3nCN3YfiqwYE2+NnEN9ADe2Hi1cXW2ya6YyJk0EkQUASIlCWQBNcyY0nZVwx65oAXZXpNs8ycD2vrF4lPryUE15Z8HeK0EmwL8yz4433ZR91TLx8niBbSjcyotgWTnqqs4wDNEIadcuNHxMMSypXRbg0Ynyu66QhSsJlLFpAutLXL6etr0QTmjpd7mJFXCUQqIMcCIGPLR3vmBtm15++n57Nfw4Af8Sl/z2Y9p59Y853kGGHh88iRwTouoVD8CIzRhaQ3G3DY81w3b896Rp177bBa+tVOHubHY0G2z7S6alq6vqgjXLq6N10LsMgslwhZTAAlQxsmVA9lotYOwsBYHqBsSO3ZA8h2SaN7mpBgPtbgtBW7KZU4dl6tyQDKgRBSlXWjf1xHgnBxDSzaFMeZgSbCCpVQgUEBBMYBBJEv/eKwVtWjWWdfsN3ZuE+V1Z46dg23nau5YmfX6l6r/5qwn42W//PiAB7lw6npDM9UpA/Nw/NnZRKRtpb413668+YBVDF09eBVcFHDW2x0y2LAVVCEYpHS2g8gABEgIWSHKo8iLypvUA9O3aNycslOTBelkIIpxusVvMlsX2AftA3sn1YRdIt0AhV2IQHyUkkyFINFKa9ckh5eRfpvMH5DZORjPnl7udUeyjG7U5KCZ8pUS/N8B+M4t1bTt4uGWqo5lPtkVnwW0WiEklZxMyhID4TF4tYyhPHqL3DbJSFkN7WjUJtwAhqlYBVIhgwnOaGDT87vTexhER+buoiqNo0UmBWWDKM/80e3YaltXtfWsz3xVr/D3ef8va/sbbY5lWRN7PgRanEwsUAarkd272oYacAHrdt84dzj9Ijz37ZfTr//t/Pxh4zg2LsQJE70WYaHXpgFXxGE9nkZyXKVA22Ln2OWSXLOdNUJ0B3JaRPKEkygJCpDAWTLx9lLlMrttvXlrtiuXISzWg5giuQVpUQARRVTSJgRTYCSj6UDcAIdQeEcPl+RWTp0hXFEjiqmLqCIit/efL1ythTNNN7voVH+lb8YrfG36nS+c2m0Y7Gq0mmJFkzmTTIN9pVektW+WuqqGrpoH3CyGY9G/kN5UqKHGLQgjEhmJqk+lMIYwWYT+FDYtu36XsUiFQ+Jotpfm3TR6Wul5YeEvURpXWZAgXcSMpIYGzEhGiWilimeu+ELNJxeQZQXuAdoCbgC6wTHlE0U/98a2/P+bNh5tk+/9mLSYwG9bQQ/OJBf7UG/DfaqA6XiUbFvGSxgN2TYvNocZns3Y7pAbSdcGWIgrS6bvAKeZnPYsbLoYBk+gd2qsOWEIyqkZBFBKSGEWA6I3dLJ8Ec893h9xgPf7er3K5x63Hb2b46oOUh1KVxId7Br7qU/oRLj3WpbcN2qM1ml7d+/gu/K57n6c2Xe/s/pWTeSWsT5XupJijcRpSomHlTNAvBcrDDVkxYKWgEMWFcANVQQBSEbrfkF7HVm27/cth1qVd2rrQrgMRcAIgox6mxPKvmXptJrTJI11zMfYQECjRYSExRbkzlHkaARhjOQIGVbYG4Fnv1HDY3s/FzYWszWZjS/PP7y86jfxfj7zfPYbrm9czarXklo08tAIT/AZg/I4RWGDo/ek5pPN2+6DqRcPaLr+punLwfW0ghSSARVpG1NGGKoBaXQG7kQtyprjbuPiCe+HsTk5ClSLClASFyEelPuwhGOW1mBr4KqakQAWoBHAQ8VBKBRfknbqou4g7q47+Y5kd07KAixXwseaQTDlH5Xggz3wP0fZ7r9dT3W1a/Ti2MbrT2scIWXNlhrGrFM7DUlMCM1ObWrGAkaKDM3dZk6jOzM8lfwsXAXZqCr2QGsm2tS50z/YbXhUBtoTG8XeDlYxKMMmDUApAaQTsa88bwqeth0139/7P7W9r//js59d5oaziW4S19VCOqGKsteLSihnJTo5kshcblgLrau777p/iY9d3fN9h/nJX8633m+aGifOX/2t4hrNIAvWrWnhY3drMo6wFVMr+OVIRoutJAr4G1iyJpIx45ClloPRzAA21HE2s1yA5UWWr/rZXAxVIBvvzHUNdq7z1LnkDFiEGciWT6HWI7UAo+mC0aJvgBHDEyA0dxo1KAWajkBwAPnAAic+EksDC5Ths+7UUg2XJefry86t89Z1zq/dzp79qn76swc/hPfx+U8Pe7ZmBsscXSONtVpQWUcTFbB4B5g0gghjSg1h4NIM3T/5kLZgLRaD6YXTTk2wcDPCzMy3o2Blb+OuK3AZ0kdhQw82ViPvd0kylXpSTHF+dTa668nckc4gCap5tPs/yMuHnSgpGoF4gtSXpMVVEDcpnNFowPIMTPkK8Sx2DnIpnyzB/9yI+3+2w/nJdePXPo9y/xKy3BGOl4ByF0BaSUIpnSOSMyk/7ZSP2dBkhuZm6ECPdsYCsyE6VSk10brqNjyms07ThgeuZ5HsESgKFaPmdAwDVtjEgAREbMZJJ9lE+YN70AN6xc2LV/RBrV1/7Vantx7NLRivPfm2n0oaZfUsXYsLxkKJ06/HS9x5vOdb312w691M52HTVD9xaj/XmbTyyFGbfuOI7EWw0GTkzCNbq6KERAFleCugzWU8pGGJSoOAkQ9JaoplDDBAtY6SLRtksGz5LptY2zN7nVV+jWcxboSAd6Dr43WVQwih6KUkEJrPiPYszjQfML/zbAri3HGDKKbi5oABFB5AI6AfRvlQS1CAK31brrluKhaMwKAYJaSKtELkctcqjyhy6/q6Y2NcuIadJ6/MsR/f9zvtfXzxctHL7WTd1QM647pKS8OASg2M0KiT0lXx0fQuZK4XLz89uXBuNpyeDbZTwQZkhzQEAUIjCJYRhJDOm72ZxWCflTWtuBr6Hkh8yTZrJQjXiS1qe6GTsFfO1UaopKuCZIGZC8/XSTIKGgWh1oUvqfEZ5nDDFf1AkgNM7ZXIF718PAexFAR4a1Bdfm0K/vRu0j36aDCdPqb11RMzl7suVqCcTLijWqiEzSY9kOpjqJybqjpuKIb2ZqzQRwKFmo/ITM3GXdh0tjjzB5uNraStKAQ1E8I0AOZuNgieyyarHqnAMpEebDk2r8Tyym8/G6+PcBBrBAPzKgwCDI+r9LMsVor9H2w7vPv560t9aDv5ru9mtn/YtKM2jrneWUzBXo0lw0LvmConlgzxIMJWFBHxFuBvvVqwUhwWOajlwAHw5K61goKbIpAtzo2gEQ6WYwY9II0IyjlbRDNi70CJMbMu5VJaD4CpHuxwRwREFcBNQD1CNgRFyDJDIX6EIweYRKlAAoWH0pcRQJERxiB3jS80pI1qqAv7KCG2wm7LaGRGVEQubHrHMqKVz/WRz17+O/UJ/I+3W0+9OFF9A7NGNcWkzuZQsvcUmCGVRoww14B1vXc0sv3Ch3xYjODs3D5BM+E8EAUjtdsAaXAyZSEQ0lEFFSW3ag5/ZnqfddbuXPFAZBaciDZAM3aEZJ9gTKRrcB1cr1gb00HQOAiC4lBxECoIbSpSAtym2w24TujuIbQA1hny9gYgB6eU7w1QK/DdA/DoMdP4SlLPpsF8fI30xKV1klxUz6PlHF7b5MLKJ1O6QHzp6djD3GTqRI8dU5a+4P57We+06Qmds4I1x5RuyjFV6ACFlAVQUMQuR72289xkGzOWzAU2fKhG598P3mZFxf221ZS2azABHUIZ1rCujnQbbjuF03bjhT6wP+Ntv5vZdb9h29OGeWzuYabVOt08d6x1LPYW4ArcIC5iC52yGfS9piJYEgcp+j6AOAQVsskhQnIFlHgATGiqAJHWbGIHYj7kWJMMZCLvzKXjAWcTst1m2lsQNADuvMWyAFhOhPIyo/BlDoUThkhMgEwocgopoHPrSrcz9nHo47EkqaXeZqG5bF9v82s7deLmvCO3D76/v/SXDue+gP/OjGZNQnQSLADNrb6EgBCqMmCdVEm4P7loWjwwDQNHtCGSG0mBjgFMgBS/3gA6AwamBS2Eyyp/FVZfgx3U2ifQZPtcECeWJkvPGYfenBEYj75g6cMCYU3Q7IOsL9meV2Nka3rbVelLckv3x+CiMbzeDUI9u/zUeOb44QE+21M93kjr1/fo1TfCcfGCK8cP6G4OSqq6BJrq5K46i6S56lkUD5AeimQE1yZRXx2yU12HhgAqpLfKhgWdeTqdeVrW9U0K8DZUC4Vhd8claPvs4OXGyZKbzFB2r9pOLx/T0P0CD+Z3rEo5QDJqCtpJBT3iRxGwWZaI3ObljfPtxe/Gvd5x2bzvV/rcTxtnc+NIq7d3BmojVDgLWg4spaDFcbugKApKx2I38NYkMIRCcECuNSsWc8TIiqCmWRSEgx3AFISmAjmTs2b0ILyTJz1S89IUARMwEQALIJMEQcHTGCFH8CTkCFJqpCh2URiCnyrkcLgSC3IpccS3xr1CyyIMVr13EhnXRa6IssJCs22vDxdttmjpxq59sfXl25f/yvkVvnKaMLGnZh9EYBJCBESCgGaTRL7Zocr08x2+O3mVfGLXsn4RGPCULxgpRrb7DRRIkgMdcYMNhM9IZtPUBlF57yyJKpvwdhK/vhk7wRqwdLKBb8FEYDgVcrT1cyi+clUL4p9iDn1I35QsM5CXz8/v/2L3rHz9YYNN63jYA/9vHPf/eJror20T3w3y4BXVCz+FDjq6pKokEVaEI0GyWgt95yZ+7MQzcQTMIVeSnsOke++CnLAnveo2Gp35IG16kNY2JSOjQv56iIZKCRpsxojXEMMU3Ex0iyHBy+erV93D8MGlbjtEp6ZJFVgmOQSVzPJhlaBrmRtoAc6M4+6XrM/9ruPd3vZpYduH2Znnk6Zi8+iVKRIDCnGiZMeg1S4iKJbSRuGEFke6Lmfg3aD1hFYFWLticXYIYp7EOJgcREGBbAAKmkABbYFE0oySRN1yfAd78JFnyAwcyBHzTAIBUBgNVMAx3AAcXigN1cQJrnz2vtI7KWFE9hq08bEVjJEnvhjhVp3kYXjARRhLWZIdw3Xbxmn7iqP1V9uPvxjMsHnpRvLGSQtV5RaEYABQwIRd2GB1uj5ZB7qmfSj5zclFOil4GGyHtIUWUghkSiKLhNBs6qxzwtp0b6DnGoo7UjyrL2LLtFczd2ZyYuiIRPOlmgpBChEFTfFIFwkqybbB5BOm3WHyPkJqmotn8et77fPNv+52DiYpXytKm5sB2r/aVPY7JtsTWmcb8D3qRafqO6hgImENC6eaI7mQ+ECKJ/Kxxc3AWUZm1VOVP42iibCoQiWrf0DOOZFNF2lNG9Kl/LZnilQESAtlU132QBNpseW4uRCH+9/B/bhx7xf2vkEZNZekEUvTSGl1vwWaeR7W2j7tivai9zyecufH+s7HjeMfNoz1uXavl64oHS1dTse7pwRrh1hhK7oIsCKBxa6tkMXQLiQwLjy7KLVuFD0ABzBUUEmACkumDNaAjGVAxfi8fiCCJwDLbqCigspy5qbSgNLlQAEOEL/PZ8Qtwa3AKrdaYxJbISXk4pA+FayuSURpEI9jS06zhWabr0dq+epMhpfQtK5xuR629JOTV9ZEUfuGo9X5J7STFYr02g9P71Nh272q3rmEC1hBf5NiikICpGl3ljt+ZvquFMNC5LaQXzOeSeng0kmp3AhaSJpIpiyY1HvmVqO3/WEYmMD5lEl4pKqcxALYXUo6UDegw2M61WDTXJOj7tr8AINFyv8OcFCBfzrIn4YryXLcYc53ZD56FjpJEGfiVaeRUkXUSpvRC0X5HKo7UTyBusfRRBVyw07PXrwnYUJmla3+rDnk55vsKqxJjSW4h8KhzPGkGgDpszWOw2iiLW05r9KH5mnLjbP3J2qmX9A9KGnXVwAQVOO5A3+7H6qyZufr+W46Pd+Htrlrvq9te3vSbJvrtr4zZuiNNRjsLp2DNWunVggWCCEwBl/KSqRAKClpXjUbwZhEIWkCBQVFQRBUtIUE2qIJTUpTYsM0f14imxiQUTwJKA8wd2SMGOFASwDCyOOKggIYsB43WbMEDlbbIkkOhctJZc26yobrpGXJWxzglE4nvOjWKKerx91ghQbVghCkMZwMUqql9vzKNWAucyObdxfnH8A+WqXzC+TETVMUYKblF+dbRCzTjZQmd1/1bDvpQRQfm7QpaUyLuNROzJ6KDUEwbhoWCCOY0kKgBByQJLEE1mjQ4xrtSVv6n4C0ZPKazOZgvgZf7gaJwDRRPdy2ZXcNXn/WtOVE494t6uAcmRIuCSEhSmujk0btAKWdqx6LSnSCKYSx87b924VLQD/JXatDP+qt/sVBtBZ9i6VaOYRKBKIQKrIsIFjRqehkXC7GVubisnu1Sh9anybeQc/NAgVI99uOQ5GmL0zRDsIk9lVjpO52fnvH77uc8t7fLcy93zjbtsxuM619q5go6Ie9kEXgcgsoYK0FRFLmaG5ht1sAI5wVTDIBqiHiShabZVAeeqFVhc/DCqCKYxmUBwX40gPiEMfiHGkpsfAstoaJ6kzAlSIOUEmjknJdgCLHE499hN/xO1ZhUijcTtmzq8LTcmY62Zje2ZwOQwunhkLhIoBoL2W/WCsjqL3wX0aFv1n+cHL/TWOnsv7IKZ9EREzEbBqEzmU02UrYMjBSTeZ6lLlN+oam9KH3wHtHYZc0cA+ZNBVUwVKZbQitTHBQbCNAAOrDVqhxAHBDw/fE8lA8v/hxwGurQaA1/JuqQhoEmo/Bn7zk/LU98tpVV15oxD1V5y4MSZjift2ZpJdQfCKVqUgTdM4Cr3WNrufEoqxCsXABhz5fWfUzVXi/U2tL1dKLq0oLuZ0CbmgbYRemc80Mn5qLnV4Oh1e4uuP7B9ZknvtUez81wE23HAhIjJfdm2z/+3tHi/fiHl78pz7t2PnrTbvqrtOoFVk349ZWwMqY9AfFAovbrm+hNcMKa1ZIuWYdxdAEOAszroxwCIngQPDWpoIxjsX5qWqmlot0fW5Jl5fBxACFpJ9vgJTJctBzUh7C0o8yRiXeE8aALzNwK6Nu3swTByJC2rQZ3UTI1qf0RgLkaWygxbc83BgIscL0zibdhOzZi57V8F7FA6enV1mk9L1DGbaEkoffCSqqEjhF9QAhcVlVg4ezl6sfTfTh+i+M0aC10FmZ0WBjLRiaYx0TkN80PTe9k3dV8bGz97HNzaQN3EUEC4VNk9EgWDWf5I+LiIARIAKggqYrsI44+7sa6UCjnLrk1Tqam3DYAXSDPCdyBHxykuPzlyxffDyuR6MwX5y6WIzDMXeurFJSOFE4UzgXtctO5ZF802VAzpO/pOcSVu9IICeFdNPpuYeeXyHRfVM5sWqZS0q27ZuBG1mV+SvvdPLF6PJwcdN8SHH3ylcB9ys1GWugcKWMQSu14vR2LKXpdg3QTZwtNg3De92dbFh94v7oO6ft9kkTc37QgEmsVHhlJpFrnLUtIKaVfGDarJTZvrY4KchG1sTawaRpXmBCMKycyyizkqcZSFzQ+9mGnsKDTJABUz5fJ+dgKA9lXnKQ7EoOHgSfMSqvLH2sI0Z5lEVTwZlQQUYJXL7mD9IGRg65In+yiRD/Ma7eiRAUAJuHEqTbW0KKP5d7WM5oTtZ3zQX5ZiiLPZkVlGkQTPm4bNcuptEs7ejbwC3fdW6m6jofz+X6G5wcI2GKpZnW1NQsJcY2sYTcS9Ndev3vm+ITKInXAiiQzGAeWGYJ9qq5K3pmqjNmU0DMA+qMJwg6MEnHbKUMKMscy4vjWS9fTJ4AyMGc6zAvbXk0SfVdu1rpBuLoZebLM3L8UDJaZkqYU00cTXoy1aekb0z+m2QMuWMVLnurTio37pguBIUcsS16f6XJftpUz1m5JtXFyluoZqfu1RCRzmavRsnbYiunBxyZV9jvLtwSD4s/oyqk5kRh2N0+rAVAV2IACNjIsDeFpcHGvQ+7R+c+/4F68oNMC4O7ITU4Xfh22UgrwaXDo4paKcEpISYS4vUSPK6EkmxUeodr6dASTSsLGBnyinKUrRSohYvuoO9JDwRIgPL5O2lSHlZPmfly5HG+HJXZlULJKG/piLwJMKxY7Fx2ZOQkXFH6azyQY4ywulKKxZAMk+qNBqcG2VgK7tGbM6buvdCX1pi86nrIsbFnASOIElYpEifp7qcIWCeK4R8nzWTGYu2bhVf4gznqsyS3uVNL4koQgUA6E52xkeWR+6JEflvlNzOlPSk9BDPD0sOZS2cFhdfIdE2gQbBMAoWxU2nKNuSnKhvB7SmhzcjiCCyWR/LS8lnkB68nB2tur/yfDfDNHfq7rmv91mcZqwr5rhPhcCXpaYumtOyO1i69QPVEiqOqngfBU+EmyPSkdw+FU2WKCbuq97Y47OdY+MO92jBTXK7U+izuk8tcBA3YMQsx7dTMts3wsnlAHj6kOmx91+HG/Mq2UxCF/FhQwG7YaH7uymo1yB13p92Fl47Fhh9+5vz+zzZd7/rHRkU3U61ysFQLYNnvFgcFJMrIrAj4AgFG+EKyChcX4JsEAdceQRvlknt2lAf1BXWWl4JDwGWUIORxSCl96RcFSjwU7ba1Snw3g3IRPFsHyxaQQllZaUYIaSLFEEWh/Gjyp5vs0d0apntdnzyoHUaaLrODmAJ2HIiO+6XmGxChYjNsWfp06JjX7qgv1KrlRkK1MitmvjUGkUUhMQ3oiQmSvR5lN2HtByieFSTYYErnJB2zcErCTcUr8y5n5YJwFyM4VByAxzRPmXiooWtb26YqzSR9CZ42h4H15GCMMgX43xXYhC3XW0m3u+Jiu+0i/izzuCa8fmM0EiRohtQhPqnyPlSPIhl6MkzMxvUeoOs8kiBRI72b5NDfZ1Z/lsR7Vu5XqgvipGyQaRUMIch42ybJJbr45NGrlN0rjIeRW9HV2QeiIsfiSJolcyVU0AkonNeccDqcm5qX6G76Xu16V4e+8a5nbBCLZmPFuAwLFBlbCATX8hSEmCReEyArRxmLp3IEDygxK7NFJZ6l82V90VkIgGOxL0cet0YghHVZtFgWZY2UFlxOmRUAnrCiRfElEFmZb7eX2WRm5j0jxA6TmQ89eeedbTKnaWO/8FpzUR1Se0cBwV6EEeHUrEwtMI0StoQDFPfFTXaFvmRXvqnCCQQ21m4PzUsjEGxmui1cuXyFUMW6dybed+6AplrWQg+JSMmK8NoEvQlDmIALCGcbAIUrgJ5xkvfh7kDy6JSkM9A1XfQmB11eJP4oUHpp3W3b8mRHWV9Tbp+GN4VTg5glpIlEalJiylGbmvKBlHeTdBZuykJNco2tejLRPIkyyd9Vq37iun/izP5AFRWXThLZnQ8sKMJVMbQbCZUGawf3oXflFTZ3YzcP1MFR0Pwx6wBg0m5+ktERpmEXkHEW3a/4JW/u7vt8GHx51dtJ/6aguYCKUCFOrhUvT9sDxJpyAG9V5BakSijAFzQfkWEhGe1RWAPWwDkgGyEOWSSsDpdSfPdFhTgBEOfIKShHgvMlgHNTQMjkmkwoMqK0Eq8cK7NgyWDMsNIWNokCgIjfXpbohTf7qxHSIZs0hLq0YYDTF08o0mYP3uzeThGUSqY+dYVvTu+Z3VZ66hy9X5Kr0eHbCTwRCYF0fMt7v+gKbOGS5K9JMs+seT3Ss1h6HGqwM0tHketCuBhIF4JFZURYkFP7FBQuBGxzepppmT8kMpc8XIGDJbD15CDLc8sPL1XrseR6G7z5In35FeS4B0VC3gMtFKSioUnsTIqnpnIsapfAs1rIe7J63+QmZgoxt+TQV9khnwZuSLHM1UqSFuJnZ+dUyXTTFvbvHn82R7+eHP9f94bvxN52VN2eToQ0jcCsMAmCqt9et4NeLu6r6cXbV+qPDr180b87s6ujQgiDAoxyZUdWppRg8UAcHUeWsCIsyiz012SLwGUHcYwEoakIzUvXLhc51Uv5olNY7NDIgtyBeBwlvsSLRgBlmZVZmUHpo6xxhrCLeXDsUgl2sQnCdKJ2O4qkGxw6BDSNpqqFcJdb7ngNm5oTyxcX55Kf0+7lFaSZUWBq+pI5mkmGqWDOSkdx8tHltu7I1YjhBEaLPS0/BQFhU5ce/E/NIil9SMofCpfARhBuL6fC5EiuE7Opoj6EXTBQUBEAATjoVkB8AvGFJLbhUrtyuC85LsFuBdAOphzD/yuLcA9cDpDfmJr5ZhO+26Hql5nt8c5mpHHmIgWSoyvtoTpCMggzinAlVu+rrlOQSqJwPZ/DEZ8rfHqnlAcq3dKf6cROVzGvIuPq4EpSdbX2YI59v7f2v4fux6Wn93/compUoWORyJXRDat7p1d07vprealpOvPnO/X6e2sP0DOdqBmowHM5mRgDDpYA5aCpWAHXtiAWsTBbc0IcgGzE0i4DgZKmHg9QgqMtAu1CeIDli4jmwjVXlghNhabXLCIrM9ojKPIoK19mNewC+HY5kgbCoIJpS1tMeOWM8UlwjwDd9XY2hbyZWA5nyKXyg0s4jeNEVbhnaGRxyrdmNo/NLAdNFA9zRw9wxB0cshy4ahhsZarlOxs7tBg1duE6iFTfY1Z7ZEkPajFvAzAU4cpF6yood6ICsnAGgkASBJFOHGPAjzFpppFumsSMlvN+lnWOlBGfykGTozgqu9iMwXrHduNlp2Fb2vYy8LVKCtqDjrSdhMXEg6k+kuJZfGw6Jbk55IZJz9MgyubdKVyz1b8ouj4fxZestL7vz0wLbLzCCZgBQZppZHZO1o6j49+4Y//Xncyu96D/d3Pk6wtQiEguLIlhNzTR4/8kXuPQZa2ml6rh9Kff45/fbbrteg6J7azROIoB7NKWTlK8kykSBtk0pmch3q2XNB9JGxAcjuZeFiEIjhFkSFFmIGTQy0iFL05HrnTSBNckbwIOh4BEWXlCumvEoBIFEncEKNL2JbrTCAasvA6YrDQQThU3MIZ0G9zlDzYMJYXuvPUuT0Eq08TQjACesK1nIMD/PtNBS0r7lWO0d9RnVWGxNzFDsUuarVbbP4FOVEL+ThFx8juSHLO7jo+5QQWXIrMM6VV4YqFDWIOEhCQlxAG4IF7DqF3JDzRyLdk1GZ6fg4Ml+CntIImyLlRtlNbLy04Xn7HVvqiF+2D0BTc3Y25sU8lTU95BZerZCYyqjE3vflQ4kdCQWWSH/1xzyK+7dMhK/ZFa10kqPHqYdDaSZJ+SpKNbm+6G7/aO+zd7vR/mnoH/Fq70ekPL1pgNaM4cxCCpepnUWNz+xF26swLe59hkfvFZejX1HxJp8dxoT2OH1Jd1ovpUXXTj2KRugW9boyriAp9ZiSUt5IpSmgBewLOrgseVjMBlpfBFdC6AkJVNnMeXpWfJgitdKUiUNaEQv0tDgtxqImkHYoQNsMJ2syICEpTU75wxK43Qy81tKTOqn87qHrw38d66YXCbaZA5dsREUkDwcM45a+G22yWDl0ZCi5M/HHkF9+46z02+2xEzSuxpzUwvdvz8qbJsuq9ZrRVrviwSGJtDgo+nBKdOZs3Mci3XjaIlMQok4pGCCCUaDcxcwbYKffr0Pn12Ti9qcLMcBKkxxSvKP+3fhE1ffTV28WjDxRjw/kll+hRMUw2P3c4InZr00lQPUN5DzQSXQXbJep5Iz2GPnYpmt+qzcMifgiAXit2BWmeSbs4J7jzbUZENy7Yk5Snccpi84v/skat9d+jp+x/i0PeXbKko8fHbwhAiYpIwBESruulyRw/OvD687+vG/Yt/x5pUNrxrMADDPRecaCrFFyBEQHAw2PUPO6obI2qcdHbt5YIoy48YI+ulb4YFzRZ7Hq3llQ4YHSRDv3gCcnHgmwCjMpelnHMyAn8YX7Bk1Sxot+O2GJHpvdv/cQiROgYc3S/h8xqhMRFVUSLP31z8MCTr5hmox9Z21S0fm9ywtHtjc/tpl84zjZ+Z/gCMVfx05GRGN/hC2O6OsRBI2y/ew1/S3MDWBEvSvYRbfB+q75PttNquzeAcCrWSlyNzDUEnCvMERRBKFwiCHhNXzDj1JVc/gUujmWsty33JZSt8pAPIQY4P7D/4p7wXH/1y9WKfv+1y+uP7Md7uV+X1Juo2AUYDNlFVzrEHXUxhSGPlamvQSDU7TrTGeleVk1nx5H28623bXfZh02TWStpoylEZaayCPm4wXbi2f+gT0/v5r7jgsTczudOukLeeo4Q9kfEn6sy8Ow+VD77p+ee98EP/pI/N517zuz/z6f7C9Y9/5nh5vIHXGnQEr3rGQwgDEpLY10ZU50kCRBMPbRbCz2bb6+4AlhZDW0Zz7ixmQqln7nzTtgcYE7O5RDoJXaq4KR1Ryhse+5N+WEhObcYnpS5BfsV/Tp5YdzTPZw4/njxdWxfbA1/TxjLV7MoENbVfIy1pwohJHNcUjzg8nbfCF7r1sKF7rlXNJx4ZG7hrgTlZ/cK2i4s/T4UQnwRIp0MKlvrk+GjKLAfqk0XXBgMSA6iGTBXC3g3kQNEeIbUTABZfvfE/3V79Ghpf/X/k36sAMYT58yFOv3sV9Odf1vb8LvZs2TLZlNoqnqOLTDRlpC/bzI2pjA9QAFiGYtTb2DTTT7x8O+WqhxMu2uojNhFfYUMow8r0Q0RuX/G5L59e5gvHB367m81FZ68JSqVDk6EVonRqcegV4sz1K7n+smdff+2Hnn/2u9/84nNf/j/Hyb1CpWnu+Nh3iWu28OXtawhwNoaybKUPwZijeSQIRJQsoi2tCXsFnQxUCZPfwfg4WKADLTVT1SB8VdGsuXEsNk1yZny7z74XF57qDzyQc7GrgZb343zPmlbF5RWmnh7yytVFW5fnufVswetdl4gjYAMmVdBLeg3ZoRn+euJo2CECCs/Oaoz9ZKO6m7SB1ZASAmnxzSCxINRn1QWbXmf6yxSnU+C6et/SLy4/89fAAPxRDfitS97y/3uPu76/XWdukfUWQN4CoAZF6MyEeYaegzMdJsYykd04Qr6Knht1cLWY5jrYfN56yrUPp1x+2Tyx1cPrvpevZkUjvXM9zjs27vtQPvRrs126q2l3nZaMQqkm1bWrSm2/m2fm+pe/9MN/zQf8udf+7c962vzcgx+ZhTrzR9lOw7ns8RB2ovd0kQ/krLWAFhWa0uJgj1og3bIwY6CiLXCc0CtGVStE5XZmaKPUtVQr36k5WtGpUGxYF1S2W/c6dzeTu4e8fNZ5VceyzwKL41w5Sm/RHt2fzj2OTTs+3vOCtZGrrnotoJGEQFohpavQJtsKdrLtPeWvAKN4LqXXe4Q6nex1SmXokfxalwgI02WrBPB55um2Tu+OVTycAtbNGv6j29egYCKY/3cF+MN0FteifdRMfANQX8NgLzI6IXd4menIjbmbmKaxQ8hV0EMocyZrhi0767SbP55609PmPf2neMeNNaCpgQXFH6fR4PzTeNCT7ZX/ZrnglaXmfkVNMuJa3moVA2sc1Jpu/oue/frXfHh/6c3/+KWn9Gfv/cjLWexq4lKuxrJXJCDl19tsrkWADagCk9BqYv7oBdxQNwEDBFmgE3QuqN3TTMA4WwuUmlVBAurMutifG1WmArX2ukPnKHiXHW3H6vTI1zWTk2S9iZYkgEbGqrYuX525eHvGVfcn7ryUV+WJMU841V3RTVEr8kI2f10K84IJBhhcCyk76V2HTLtLL0vKRXlpVZnMzxykOam/hno6JyyngIczwNe5Sv86BiOuLqyqAlz3qb4eAj7dxHgOtgydOMKIYAaoxW0YTp0xUQ8TtQy3Mn5IuT25DSCCqqanusHenHr1evL5feNE1ZtmCPHGHDKwg7potZ11eLzCF9ezn9z0VjdIh1Tx7R7RSdvIOhpERKvufu36fB/58Ge89a+/8Ax+4YGPfCaPqtendfpRlQSIHK9CW4VslAHFYhalQNbV0RqjQQR0jhjzI5horuZgiLlCneAJEMTwnBiBaG7aVjNkoSp6WleZREuTjLI7WzjXZaP7aab7uGk6HnUS556IWtNrhIFjz541l46taNTOOzJfRD7X5efNM+cxGjWlFLKBkf12Dna/Gr+SoXcbDkHSDIzlLTJ9Uqvhz/dlWC7dJqCCgKWw9Vts7cJLT6+qeGjK7HuTgxAF3Ades09A3xyyvU3YRkPlvgM4gl0oPNgQtC+F1I21MD5CdnD5mn6fNDmEs5V6u7T2uKw5TptnbFtNt2hAW6msbIXyizy/hTMP1St9rj/4y3u1/LJOu3a1MGb3wIHu8WcpT1HV73pJvPAPvr/bR74/+crt5+/56FgbrWjXOwLESwdBkwNEJBBNhSCIAgImkLGzw4iOj1hcFXDDBQXcBEZT8GhONhbGxg4oNGeGMrOGEnFGMoJ1X9s4Go2eTtzBe+6dz1vyOa8vs01kVaZEPFZhiavdLPHA/fOOVt3rinNPltuWonBfeanIRtrBXhns6PzPRW9JE8Ln6Sq2JntB6uLQ2wSVjXIDzCAh2Dhg8z2Q7iL7q3Z5PLFlP1GkB35oOcjAvAXgz+v+3c8D5z84crvnW4DrGHhcYq9kV86yElRwWfR2KlT30U4MhyyK4WQIYskMdGXgbBpUp1owYYe2NMpchBtbPOfs6SFPjZf7dFdLd36q4YHWwDVk6VgjAkrYPDde5P0Pp9zw7ezCxy2Tkc8MOuMoYwpiAfN0d71zWj2iKNQJ7cJZAcUBoyboIxZUsAxEOAfgBhIVUTwqtlnkM/UObKwpVdJBFYKdGc18qcSW26Os8UBJz9KxnrO1zU3Md19Y7vtkza9MNbMjkpVWbaqVr1nDkTDbLA96WWd/UNavAyjs3intpBQAAmhgv7PtZMs3w8hlpykAuR2LwdplTiF1dkitUqoXi4WEBCM2BCg7ErYIvay62DP57HJBmz6o5VXjfgwmAP5PgL9Q2PrYW1xD++ePe219BTV2UNlgINpeW8kRXOxyEbJTyA2SG4weDAdAGBWpz0rm2bS2c2k6qkaNYGhtrDnKVreu19kvzq/yZSy8HrOUYjaKaRjnytSpCEYGj9Ejz89927sTbvulOe/+xNkrRaP/hmuenovZ+0BACFtoOCCpOwJ1hIQmFRKgwKhEzxIz+ghFE/JJ7RJAyFHYJMjRMoCDuSEoividhhakoNLBUWYGBLQdm5C19j0790b+Vm8azbNXPzZcm6vlVfZ3M9wrwgBnFTr07Mm6RGLnDb1hMdK/eckPOisdEjQXnyo3wlMawFnsJhUOzUVvyBkXnk1LolX6uLIfvEg3MACysmAGpgLBRGgLxjU0fgVcf8PFdhMMI3AbrcEDwC8WwByh/mzKdjsicYtxH7HhFhuGFFDG2sLNq/xAYwyjgjGXnAfXRazxkELoP0/rV6nPzY0ko4qjMFotV4ZrZOzo1wVvbK/6AM782qv68KYR7crEiG0fZ5FpGyq6lRbkF7gl7/OJb06+er3LzjvTkjbzozbgV6/DLlIFQtgFCTxVXfkBXnqFHVezGZZ1MuAY6tEhRx6pjuaxIoBDpGaWpFi+iwGKCrg5zTRi0atm3uVHIT1wWy3lqp6xEfG590okyda1OOkp6erJiTMtmr6/2/mYH/CVH+8n5qzM40ZYVcEbNRJlXD538wP2KXP+4kUuAOj274/bS0Fr4YWYD4Pr1eb7YdtX5Zo7u//lds/ZKrM4qNNg9cUyC4IlgIFmFaFrZJoqY+2ibgPbBDYB63KwAPDfALwl2zaE4FT76wCha15rCap8hE4IbZOjIZfkBzi+l7FavCJ1aDpMXd+8Wk/YgEVPLSSpVzFCx4I1P9x22g99uT/g70a0uhjRJAytRt3xBO1k1dgDq9oOX/jW9fl/7sPsxQ+bZ8IoTcOb0LVVghX6uzYf2O3m005fD3OBHkB2HbMZkAzmgDm4gd8Gy5gEz+mRivkdLjTvRKEmIwHcAInlRc6bXJXQo7/WhZS+3rmtWY9nUm5gDlhQ5eMS6+azsSVsM76b8/3xPOdOkeqVn4xNXF2ugL9uTQs2ccDEqqZUPXv57YuX/bBZY8/YDRh1zUJ7R6PTptZQPrn4VwtnCL4UcaKeBPZ6Si2H3k5SbAARpEJqwpYasaUaRzLdjdK6H4NtsTw4gPinu1zHiu2bgSrf7qp5XIE4NmqOPNBBVe7lAQpVxuGyMO5NcI2004mMyeA69D6RnkWj4AimwV7uxBAgxUd2bvhhR+t9fUrnvvo6N5IRb42kqQGK8EesGEVvKO52kZ/3+z7WLvndGTs404HWpEImwqipCmtTa2xCl9chkLzSqqnCwUKrVaFnBz7VkX2PW9Q5jMhckkq0G4soiFsWQR+huN3AnUfAyZhiRG4SywpuOHebrifo3Nkxpq9Sc9acAlCYoihcnoPLs8n4CVl21WMaxef36/nOudl5+vpVXp43Fq4auCbaKJDmUPs2z4PW6uIcXvzpoLLc2O12Sl2zdAt7wjwMbQ9b3hRQI08FiWXQe1pSD1LvKtlpstlA7HMklvS+hrY76fJu6mLaAuPwBR/+bzcIwEQw/5tBan6b0PQ81eltzBwVcCwAUXZ82jpFaJXxZRhDmhhSnukNGI6CVFC6ld4X3XpRz0GIQCVRJTXJPLuUf9A7BzjvjB/44OXcp6PWb3VTmzqoAlnH2n3bwJojm21uys9z+2njVd+csINznXmwdss06xRZdmkOao5lLCQKA/vjjhAgAXUEN1HAaY+4mQPZeLRqbpjjNA1PgHNBwRw3N93L8YkiqOgbEgJkeZ7nrBWAKMOP5LGxiJbqVSgfzh/Uxmp+lSdHtHo7C4pq95ElVDnMhMr0647Uac2Dw33Wxkvw7FON2JCgzZxAEy0X7/b+HxMcOnaIgv29yyZz8qYnTz8PxQHkk3rSLtAoVtB12+SzDTCOnrvlByaHx+vFQA98JgC3PulPh+7i24fZ5k02VKAaMJWAil+rDnKseFtXqDJuTWFDbkd/IUKX3i9627Q2Q3/rVKKbACYK2hilE+UzPPzl6UFfebnzxGJSU10QgpJ1YLRvVERutfblPm9/OOOuX594wXbC+GRDWtKW32ddU29NKxyY0n+lYlGBgwkv2dNeR6accAMDbVFHPQKeNT5i0QRCu6IJQC8k5uqGJ4Q9jOzu/Y3EFcRDYSBA7ib71ibK7o3XDTBow4hnxs71FmZy96AXoOp9DSoyaXeAYEx8y8dYmMxWv7v3Y1nfpqMEMWwg7Zp5xMPA3NbPD+M3XaX2TGRKp1XqPFkPphiSKjh5jO9RYgh5Sa4u00+fVt1sUW0AHlWHxw+PgZwSsWOfs4ih9ipsx6cQ8UF2r0GZbMxrtDMdQi6nv5NzgII1P0ywA2dK96F/Cb2N2Gllj0DhqArQmHlTcRCGl5vz8OrsJyY7XIwipOvrFh65zDY1OhgpT72g7v7Oxy2XP26emmrRDb3nsxWxslU5a0Ro2QqyO/oBwDJVmZZIuUoTCuJSUyJzAZUMli0AzCP5kQo4GW+BBCiQlgtKtHHjknCu6siHnYz0s0AGPEBZlmUo8pGHiRKM2Yv3RSFVoeFx9/kX559uDz8wbWygFaYTr7bD9nRUHRqmntXViz7smFMFzPgStplQYiRKJvtWLviOXh9ogAJ1ZYt6T5J7SOJJuBSAswUoKQnSXhLq19R1osLYxb4PdgZwAAlamdZhrG2YeB0OtWvD5jVqjAEobBVNjQwnQk6mMCdH4Ck9s6TMZFo3sIJ+D5ZKdQdQjgsbtUze0iVtd8ku6XuZVWRaUoZKlGkRJRRhxZ0qs2t67vd+PO2Wd5u3R62jkBti4Nwg66PESUpacnI4JJoysFBP8QCQYxzVFUATYBiq4DxiTSOeFly2MM7gmCti/lJotrQFyPI8z2uwAGJ8RGhUyXo8rUWeN9wWqssM+0c+t+xYm1IThcmStJdmd00tcXHe2ZsXewg9mTjR/mCp5XfuTqgJE/Zgy6dDftvs8HfoFuKnojSL+MysQW0BN4woSAwpGsFTDe13wWaiogpEMTlQO5r/Wqzjqke3getvJ/R2wB4dWw7YF0hkI+BB3BLcaZf1ztkFLxJWaaRKSZ12g13ILOFNwBxFsyMxjWXP0ljebB7fXHQwOC3e0igea4JJGt7/fqX+u6yNxvPe9P60D36/6dzHjRN6mhEHkaCJwXTa1yoLWkRS2o1LYJBImkuL0MwGOYLmiApOUm80lUe2SRMPSjjXzECAiXZjQ080RUQyASiBFKQa715nEoy0ocutw9Npk9q2uj//9kDTSRx2CSacFSAhDEKIzQXTdPaLw4bzZKF0bwNRF1ik0vKaklHZ/G03/F60aDuYpCdWesqqTyodwc1MBYCCcCoIuPVVtaBqoR57kreDdZxXz03/82NgdmXm0ctdRb+1pWq7yDo0re4gZmJUlndwlGyfcnM3FubDyncdFppTcOloBvtD+tT1bBdECaSxHCz7+USbH4fzd4fCnlQRqqU8ypwFHRW83jpt8ekXX57nnvdzM3/YMr9XEZekE2epsZW8i7XSwth343DklFVMbxJutGcTVJAfEhEFcNMFj7IFOde8MdoDDHBrAUZXjvAxQNckArKu7YkvgpbG1q6F50br/FxP06NXvn7m3DyxSkIIgUJtSZbabW3gOcDsLmiuXvI5pRcDwbSrCyZgpp2+tSy5YfGATw+6nIFT2zmU35Dkw0yxiXg2SMakdDgqUqmtEps2WokYNqnLUYLkiz69PwZi4IMJUmHL1dhMF1+k258DtVKkabEVbZUgUQdxmHKTyd2QOx90azCRHZJZDH3LMDA30JcnUyEgScAmq48YWZRXMzlvt7LvuzK7o0pUILIem4q1HqOketv3eOeTvuTbu5z/akPpxqyMJK219hX7kq4YpRXKUgkHJpBrZNJNQjJWa7Zsc8bKUX9mZz1gn9RGuGQL8ggq4I4bsAhuN2BBZzKHwUjEy+gKvJcQwto+k5bg/biswsQrYzS+5bjKB7XszvFf8SF8+7We/QMUHbujgS7dUglkDkF2Fx7u1jxr7ruaFNxH+IR2qbOMZlaWMJWX+83m5yaNXK4zqdjV9r3kMonT2Na4Wm1SBY3UaonOxbBD1ptAq8PiqNo54Ho/wMMCoDJtMwBTraIJkOcJxoCDjSAYHtLjXRhvKo6RQwN1oArUQqaDgQrpGcCNKobC7C5ToQgATkfbVlfbrnbv9iaEOwxOujErjWSlkMp6zi/pjIvzxEs+btmruaLrB1IOxv7mRkrnsM6ptfvZFVdkGllw8KAJB5nhJuF3klU0R0NxQwXI6oB5uojdAOkRU1Aw51Y8w52jeExzYH5lhuRObkGZ9JVx81OcEZTwQx1Foq+oSnm7cXY8A062ypb4wRq+96FtrwrvVwrNqd0LPkFmEYImsxDBru/kFn/gffjxhedBsbRKIUBIJFcxDnBkXuVXOzPB8sfysVRaFX8ItWmpYpUS2FJoKBUFiJ4SabJN0eozttTLoI7AzxseHs/FAAucF0C6tCYaUZDxEmwdmifcEgIQUpfgFijMVGjIMYPVAJz2lA43kExvkv+qtZ9Wpvw5pggGjXcwMnZbR6PGTqeCMVCIlI5SEZW0DT6wbdpc93jPO343t+/7k8YnVTSSjsIuG936mlYU8jwVKUuBsoZYNr1JSLbzJs9sNpa9cRKgiYtq4tGziHFjAUCMGdSNiOfbdkRYwudIlmmbI1ZNolDQ0i29lacZI6ci897Awfrdh9ibtFF2+WrT7oNXeH+w90+sklYqYZcgNc0yxUxeCpd05d5PypmdgJs4ng5qk5rppulr/yTRhZnX2sAjXIrS7NIjcfvMzuJs2uM3hAihJ6n2Da1tD0wD1XUPnAd4h4HUJEgV2G2qZOBiu+ui1RqtpUBB3N6JwhXkBFmQs1/oCkBgW1GlFCV9NNm92KN7AypEMgIEs8dJMFpvHpCnwi2oubzwqSCIjq2wC9PoYENsCPe4yRuve3fKhfyXGPGqwscFWe+4pwPEeBy0HaCQE0i2jLF8Tjw6F8FuDBAkOapCq4jPBRwdi+InEJwWua61pi0hlDlYQiXWzDI7gcIjDvTGO4Vx8cDLq1Q8UKWcIjrjswOzCEJ0cnqYLllcvXfPO8JAJtJJakzocEpSwhE/ZPntiBbS3Fm2uOpOJA9J5Qx2SNCQwHORpoA8lLZA7nbBfviTgKXJgRPYxsTrZ6arbWkD2leAqjMnQaMYOzf6QE4kV0nLQGqsOaWnVe849DaT7QVTaphGU5LDuQxDgG13Bx4WviSx+FSLFLUVm5ybPZ/+lg+bL7xsnrRRtFxlqRBjgeO4+GBxszYjjbGstCHZ8qM8xNQbNiqoMho4HkAcWBNrjMFV8ZXgkVDUYOGttW9iqkuspB3AEteNTge7aR50HbybzqqCNEgpgRXfDw8y4XMdP715qSeyJie00kVKcOpwbcZo1Ltt8nfkIWqwuc1pg/jdTDKGdK5+dIVjaBm2AqB10VZOY59ECe4CIAZK4BNFZXVXgNt0tVYTcJsq0dERwMMRUrmkJNWsHIhbD9qAASCnsqQeUKZb2NYVVxBidqzIdSPrYcs8jY4rKKZOQWCyIrJKM63ovGCXk87f7nrtpxO3c258OaoUPWsHlTnOMtoKTzRMDVwOgUXZKCvJLsqXAoWAVXJJni16S3u2CBFpRuhc6UjCOBQDWHUGTHdrsi/eQQkm2pvUcLbtqrvkvUmVBiGnro+SsBbs8FIajc1Zj+Dcc2GbCK7TCYLPEWLipGdtuj5t3KI6cACN6ADxEfTYSzOzKVpKCyejeOdCRi5i4coYSXdRgnUF/k8xMAIvd7nzXQVsRFulUceEuh/p30QgP0pOxI4kuXRqB/Fj1AgJ92Q1U2+CHhfLzBvsLjGJzfhVj5Tzw0W9FDYTRYMyKzETGstsoLOwm2VYydr1zYbznrfM9lr0ntfIEF6JlowMayoMGmeTcQ1ZG8Bn7TagBNTkS4SCIJsAQzKQFgDtTBCsQb9Kvb/DZ7GYUL8CjkgOSGhXggApYoqYwI27/OXq/jcDjA+UiERGYmDRBnOeJ+0l78RHdy/+rPSK0CFByMI3s8ckPKRoy474SXg153Y1axOrHnvvci1dSvIBKOCp5E+k7BLdhsw0fprgKAdC4FmAWqi456KOVVPfxVRDXipOjcDM4caQNrCTsPvE7hVLUPJmKe9SK5fB4hCFtNqJCFtxGjeSw9BEXN5bRZj60egRWOEtmQZkMMyglfv0NNA9mOtMNpHn7UNihZtM+tLLaVmj6LesXUMWQ1FYWJYl4NTkS4UjmM1hAeYG6AKFaXtLNBG0MAr+BpNYARO4eZyV+WruwbRBUAtIZCpoMGeBVEN963de/f1m/PYis5d4IVhcmNUEU8xM5pL1s5d9TmvWgGYOBTQbawFGqZDJoS+BWyZpRpbSyKqzS88qnplzdeoigwOykrRGTJWxjbVgAOYleKEY+LwSfFIVbVVTPh6IOgibqoipzqJNYs9BT6ADq8lIE0WkWF2xjzdWPhxq33T8eCRMmOjTJcthfCxqKlQkRBkgdSN22d54a/eonDXuBvoX37lJI1aFsjoue7wKdsTaExYP8gEZGYudz4kvIQpuykUd0/ygh1HsHTc7gjEAHeyETPIYnISJLxK3K2HSgDjk2zu9CdmbDy58U1RZtMNaAJBi3GIWN6fRZnOv12/OXjRf8AEVG+5MtGUOtpjMCxfWNUTBYCs6Q7pXds5+F9vAhRrfAzsSU3hoQdsJp/UeiJ4DMdC5Bh/ILNsAO2JPpVXAKw3uztYMsNmtI1TSvUtyFK4IMwPi0Ft2PTlZMIdvDSJze3BDtrsbmk68WwJMNaDr7MYAKc0+z2sXtBjOeHSwV0NmbygoWp0sJ9bALYcyjycwKI6TDyQrpSmuJl/qdKMrioPZojYTJRmxqqpqUuXjcSbEgBS1y8MqS11ho0QmgYGdUuiG/LP+/cmHfJOs+0dWKRTEAJMQwPjFb7jLMvAovcwjUjQdKExsa45pZSab7qWJPhltHWlqVK9O3BiPkDrsHaEod26l6KvM3V+AauWUmld8+++bgc0Lwv8HxAjcTWzYgJY+ExdIj057Ns2qGiIdWa1PXCGcd9iErp16JH3Tk2evHIeANiDUD3gRti7MyNUGygWgCe5mE6Zsb6DMdi85bXKv3YX98k3fvmFfQZhfZEXuXM0yyQjOQqkqLbm4X4gjK0fFopwvfbrRFfLm7SyzRDYei6d5xVoWB0II4bNtPyxEo64s1GrI0jW3azM9oJ/O5qs3599f9O4bcx041TqVZuXYT+QBx9/4gF++k5TGtw/O7/dt0smt4Kht8qTOvOuSbcw9kqLUL+vc3G0fRKHCiPgZ0G+ldX4iPC2fvv39aiDz/PDBUkkrmVMFTSMwtRpcLjIRY48DynRSVgwXphhbAbUJUuWW8LHaM1ClItIxwVwDLk5yY0zj94v5BKyhkHsQEuhEq0zXdk9l08n31oxNRquObhw3rltvaESMBl4wI9ywLYWCwQ2HKouw7jUuI+Igbc/ntdSN2pZ2C3KLiMFtxs0nY8ZyS2TdfPPNo6xUWlkOS2LMkkhlqahtABHPiaYHL/etZPZnKgSMCEmMFGtuooozb15piIjtGlUTGmC4YnZvMO71vFCvwTlPAAExkMyddIA0m/v8fVrAAToF/lNSN4O2ewJsB2AoBy47x1z1tTQLIEPFB1B0i0/FlYbJnCba2Lv/zXinYCbFBchi8PVgN6VdCGKX5WdOnGzGhjfjq4XOTQAxBQFGwFqoALOwgdvR2tu7wXKV0R2Fe+g8U4IKyiS5X5kkEVUOIjBh3I3FgkI0cF6Ez+sJPsvEe8ky3s77zFBZlgm5996mtejDHVdWhEilWtgVSQxAjB8zy83MUGg2uF1d+EVy7t8hhVpkTNA+srOMYebm39/SdDCb6ww/HML2PwQqyxbmOvOQHMEFSXuRtOohnQW5rS0aSflQZZ9V8VeAnQFd13ilGaiAnyLu5z0VlxrS0rWkbf0BKJEHdUqSRvRQuJnAjAiGMAUy68GXHyV5HE+kMAZEGBTcnHMZ94K7QIXUXJBSqnx72cVHyRX+hrak+6CwIDmqpUkVpoOAiiwzsqZPI4o4AkognVigAc5p6Pi8oo4ZbYcIZJlClsgAEfG3eHESpau4S1atLzEhDpMwScSYklkNgiUPQ/6wu/+bsz/pMVUFKQtSLbOV1XuFl7kTXzNHBxk6KxO7/Mwmkya3ImFvtmuQPeNpMluZZxJC2YY4nLiv5BnUfttGa1wsehkdqk/Awyoar6u0XD4J2/NAO5oamovmxZrGTsyOCY4srXDWVulE+Nxk1uEJtO5QadTDqzTL+IJGxxMciEphGgwAE1NZ5WSYwHT/xg1t6Dlf9IwXENDotB4edxajASNrdZVYBIqEmEIynHxeXSQXyBAZZYz8LZ7sFj9yeZTWIgFndonpLrWixVhMzTfLu2THHGVRtvLmd+73dkfjiQq5vi0mkVEansCxj721rXPp/GhrodkB4j56NiFYOoTquAJojU2SWPxHLtmv9D8oBMY5VO+B3TWN9eNgF0hpr+6xOgTAZCJV5Jo1bwD4CSD3gJXApJmmOCYvgltpFmNaQZZ/irUcVNtYJVCYUDGwhkTOi94Y57/ZdX29piXnS2VeFTWQ5S0zefLu59mJrTZSKtDThBEOFVpoT5nu/bVsxBPcY3PBAP1SCmIOCUHBIkFATCM3CUIXElbohNjIziOTnAIp28p2RURF5IWL26Puf/U5/TU1XvlsSzYTMqbCITJ8BbJVFODiL3fDV9/gCnfOio8Sf9Lvv0h4PngKpae+RWEG2DcfiS4hYGUyMgE1YOA9Hut+iL4A6INLOwccgNEBFhpqmT4AYAlSH6FAmU9t7ma3KR4Nz+Lmsg+byZKoRQAndENKcqWgrJ/jjo1onJx1rk+8ValF6Nawd9JADdqmbc+zV3wwk02rHw8hsq09jEyr6EiBR0d9hhFc+VKsZo+Aq6Bn8iY4aBavYVBHoP+QAhwc8IFBzQrWCK5Dd/e1kc4Xrl0e9eTVx/m7y5nf+eGJ2WpIxk8zVUSZVTzL350Vvl1AIsAkZqU527QgvQ+KWjbxnBxxbgYajSd65kpAVABRA7DButRi6Yl5DbweaAB+KIi3UPAR+DzxHH1mRouJICBIsE8VeUvN9OTmKniwm2SlcuOTwrBlqYbGzo3tohOeX8oFwvHYFWU4RkreMzP3cML2w4mTk8r0rDx2QGCML1ihtOuYAJUvsbSOgBqKnBO44ZINEkDhZDn1j7UmftmYFQXZERwR2YCN3M47uL73//LmffyP15v6S41mhFYZCU8CFILYAOu223y50PMBi+wJQKFTi06mj4s6Mazga6SZVOo8BM+APO1AMlgZAcIrLfK6lvzQhTWgqwYWgO86wLrU9vQ6qAdi7moL2krtSjRHM4ETMAFMFdBAdXgC6ih9c39Wc0BAUZlgNIhy236iza/M9ZJPCAMTUqK2rWCl4/WO73IpvsSXSEkEystoDYp1clCaLqiqJhT90kpSUKG5Mc0iOSlNo46jIcBArLDiPbC26nLGKCM7MnYRvt7G8fzjfsgXv/qc/4I3bn2xwTJQjKkHojWoafHqX99pdZMLe0wbINsRBhtD7YsZzQJOKgMfTq6xPT0dQQAkgwngWjW9Lm4XwMZyRgdeagYSALQFMFS1JQT/HdH+iaDOMJm7CDv0wCicATEVgbs6pIM9LkBJW7d9uhUI0szX7aKT3DlYPtnMt6yHhTZkE0+PmOud0xkX3ZvJxYT3pIPlyIjAmngpy0JKU7G5GCiQ+FKttiQVlKYY2UlEXPENKlfA4fGEFPyiUbkm7cujZjt3/TD/5F/4LP3Ap80n/tLGpicrQWdWQkvGltn62UZx+guDJEz2bAeYOU3Kj50n5zFc52N/UGX3LIIwkEVGUUUCfhHE18yEEsu3Ny/u9Be7gcNX81/57bDtQwfwFn1d/3QhdDfsMJKm0ZF8AjwJnVANNeGFapbdf3mq01WgsDB7d340O+oyhcZ4LNYJOjHWUsQ4cftZV8caYZUFw/hWVypBuOLKtvOIMZeampQv4SZloQIJLFtlxVC7If4atzQoBTAJLOAytADkeHA0HAd0ei3SNti2fD7z/t3n9Fevd77whYugUWQ6OFELPgG2s+y7pEfQkcLZJ5dR6SSyeFNZ+7hhNBkslGAntgOk0nHKFEBUXEJoSKSl+m/ZfvVIeRbPSf/TyoHCB/7v/yOVVuuoolNztghdINE7RPIgiiqE5jDT7Uy3o3HCMoBuopDp5TZQjEAh18LHXLMVOqKzTESR7VPE6CmnXgy1PWe73Tg0jAKRLMoc4fAR4aZlISPznM4oXzoWx42FJhR+JMoIwBTPgMUGIhkiuyMcMRaG46wX8uP/3RcOE7NI8I4NwqAJGk0/2tlfOIMBS4wkYAUtTQGKRvqy+k5K2m44EztxLTwVjx2PRLUBMCaXSMzp+hrI5yZzR02taIqBAeBvbBXf4iPSicGsmqmiWS0wE5DAAWqCWu4GBFbRVrAWFQ22O3/JSOSL5yYfxbsRz6mt0L6hmLS2lcqZ7nnzeQc1caq1VWiQdqZKxotz2UGN3h7nBTWULyUHzBA0iLeIR2pBCgQovGOxBzzkkNK3qgbZyDznSN37p4aaG4JrB6bWkaPvmWDy72HkhjiKLEWH/KlZr4JHwVYwDhwDc/AgWklT2ENz+N8c+lrU0tqSEnQleKUbCAD+d4Aft9b0oSHFllQFgTVCZQ5kEGJBKBImYYJhTmzmekZHBKYRBpiqD2WAwRgqZdl56VzSusqKdV/qvUO9anWpU3o0smbbAoCs7F1ZgtAU3PRLRYyYaAODLCBOWOwW4QEfazEmaKNciyjrUmzQ3PHqjcqkFbQSqARNhOzaq0FE0vtGo4CByIIkKMAQV8Q+2EOB2VAIBt31GNUMlBE4CdAIwrVGnlLxFZPXT4Lobu3HGj/Az+PLBc8Ncl0DuARk+RUDEMZrJm+ZsAW0CWDY4EjNK5PeOa8JwMQmCGKWwHgs+TnoEgAOBN2QXSlK1KqWaqnWy9kOdbFBRpK1tUpwUuLaGkQoswDEAXMxT18qMkUM8GjMBSE7SDujlJLFbTwDYiUYM4iLCasDSyI6qzOpXtqa5TpWmWkEQFMklCWspAsckMQX39zITO4GPKNHaBOdDHWkmiRSZhYjEAWI0JAdVX6F8C2005/W4Ga50QNvT4AlgA3UyxrVlgDrv0cA0mAYpQAJvmXv5EnCHtDkOhhDvSGIEi5MwUw8PorNAaQUR7iqc2zDDGYXzjOdqRbNekTONWVPj5EJPo7jftxfAbwRubHoiH6JCJ8pbo6ZZ2ylUGaUjLJFsctKB4TbxvnyaoitEK8hHCOlW3qHqt+IaYJJ0g5IJQwm9ruxQ0Gjm2crbTFiQ7CsICYwQk9UE7RJivpLUJAaCIelBiWJlky/6yK9lS5omZF0V43aNXbgVWDVMd8lp2pAXqNqDsqQn97UHlRSCOD0ZBJoF1WIbIepg6CpylMWZykIwtB9c7DGBvuRpAJZ8FH0RoWNC9bjaYt0RN6fOBzOuW5RuCmFtQGBjJH5UnLG70BGIniiZBEIDmWUjmxRKj7kUHQwOz0WzpJ+RullcUj7gWLmSqVmzVIZv3fDN1coAYUdu0orwf5Ugond4Zv5sEOci4hIMewDCscsxUaUdqSgfaomUwN4DQ41cuARMF+TfvVb0SmXLCWQhREByIAE3BTuDjoHpYGYTsAoLhrPyyO1lzBIQGCApNPkpp0qoRI2SyV3dO3fN6d6QxOwZYtAwJpkOCCbYA0cLIEbkL4AKXzpy9w9ugRwdDP5Ikla9GG54Iggjia4uHRFRjyRTJgAQmfBbzau71kb7q9YCdmFwa5m5UYCEKRnPMtNUIgwGzfDumkQjXuzQx40C1TgxEJUoCpQ8qU2lQgFoZHDlfmFi1UN8hxwAxYat8kmsFOlP2OzC7Cc/t6QZMiI+iFtjcoOYWg0HkFH86vH0lwHhJP7w1DAJm4D1hOgC0FT6U6AVExiatDcxDkqW71F0WiQ3do5oowmMpnEspQCcVRFPx856HrAwrSb0iUVrLCarCphCUd20PNo73oc3dePIjKyfZEigC56qDWpEABoQwGhbDcjLmIrO3zOuuABJCvV5qI6ebHP73qWzrOuFEUr5fDW8AZSGjgxyjYIMdW5isEavGQgnXlaHL/tL2g0MEUI1X4I2YIoIdoAeaExP6ou0wVoOdmwtcBBz3CwhBcTYF8gswVaLiGF1PBio6yAG0xBiTwlnZPLxeEQSFMgaPlYHcu4lrSnFTaHBmzhsHnBwZ/lzEiP+tJSKzOOYAwjZMHRbrfbjCtrW0AzRgB7BpA+X8RAWGSFjER8iS/TJGa8BK0xq4ECMn8Q321n4hAHiBOHOHF09wFkLvs3ZRm3LwrEF5i24caY2ka3SH5YALfM4kh2kKzMHIIULQonRYA6VbA4N7A/N82SSZkC76ilzPNJ1104t8Ao72SSTJodboKeBmAzV1mIg0lkA1vI35eiC0h7pzUJKwTzJCSBOQEFpAnlhHUOeBNEm7t4Cz6+btSod7WfEZgVxqhBnDFZlQJWUJ5SAKsjG4fwuC7Ad52eD2ypNOuL6bLDKaoGZRgh0CQ0qUQY0NV44/ijapdpkYiMZIv2Y6Sn36btjgglXS3GLOGNiMdoZPTzREKaNCN+/Q5r5Vos16pQ6zAEUYFilWKfTedvisLkGeXIUIN8X/f16WbipKtIv9yTtkMR3UudAG5/su/1s2YH7As+v1swF1KL37mawghg0TNg+pAkTYtGMg56HIvKLJ66a5AE/o7SBAPjpfrk5JKQTKq6iXFnl8RuikG53hRpfxz/cw+BZU6F0VS48vixzQDbpCURmAGCVskaomsWLUCLBRx5TxohKTXJpyZnHThpwa3GTP371QabG8q+aPYOnMfq1D29Ch6sTFZPanFneYeUtvaQHVZOEY+uLSICBILMcj8hhkSCuQob7JsGI7s1R5uX/7UGGqUe1ZgqSSYWI2TZpKKJcxaU+By3Z7c8qol+HrACK5CuMYlRAnGIx57CjTBGEWLI90Mgt2Y1WAkjccVAPK4rGXTbXd+mmyEu8SQ+8SxOchLiU3DVL/hsk87UhDGqtkCiaRgwBpgkNukhWdqywwNNKF9/f5GViUmSvH5RUTHAMyuJYZjHEYSMFnur6INDTowUBK09AGNApWF3yZLslEPNxp49Wil/e1bbEXHz5aO5Lz9zY4KNcH2QZBAFzQiS4pFkmZmUJWhL0GnEJmtD6cDBUrW8T+XfoHE+GZIs74KmkAXMQilBpF/k23Wm6fjjYwAtlQJmSplYOsgsUrqBQUHpBGmwj8L8sKkcPp/s5q2jxMQKLWUYa4gv22VeNZXStZ0aXjMgu0Xlndg1E1pKACRu+y7iMglN0qNAwFoeJcdSgg/EFJU1ZB2ByHCAOJrLFMkc4kBw4ziAI7ZBj9MU/ULPDZUxjSzp4AlgBDRhDqIPnRvNm9CicCM8vM6YxX5cNLqHbpf4VAgSwGQ3JrU+6JgiKe4xyQxAtDZ2mlJHZaZUM/uLnTA+NnpWF48S9q5+dtg4E8BggmSbotToaioPQTkCKXc2YD3bgwDLJX0wV2IB0X2YVrAlMAMtpaKkWvdfgOoCDsrjAJsTr4RPSxPYgAFGiGQbpJcOIcIIc/4uaZQ8H1JHK+Rg0DWJlNPLy4ZFVSmhGuDLKxI3bOr8SOMpAWA4Z96Zi2ZZPI4DuNU/hTLZ89brK1e/Lv4opkHM0aMBfAl4AGFx4UsgtnLBxX5iwpKtAEgcVpKSwMlE/QLPHNtEzHWBZcMUcJomIxlPD11ScLQZLSpZcdYlSsoTd5MiB9U4E2h1I/GXauFCuXoS0Nkd0ZH5ocUIadZOzRsGXOMdh76jToHKcx3pnFQ1lYuILwI2B1BIsCDhYmBKE0ggnIbHQwIoaX4fWv0h6JYXgRei4QLbNThcKelEPD+DZAVRD5EQTUhGdWD1O7sT3R72GGei/EhaRDJL9cVT5gW2Fev4oNntNZNLSwICCCBrrKvd6DJganz72VqlidcKaWREdgQODGBROQ6T8XjsS4dkEXC1SHbSMt011E15GxVLuCyD+I6yMk09CSgmXaHrXank1ZCkhGXBadQCQly6qi+AgwCwUtFvMb44u+pDjChVC6VIxjEReY/n9oXcaAE+gzg4OY2S0BEHFEanVUxlphl96JoFkC1yGaWnLFZJriCy+lcWDhOKZao4NTfd5CiHdxrFooP+fK9/rabMzdzeSgKNQKSBZgV0S7IigDJnMhw/OKBcSRZvl+3ArEJOTBYOcEpKigmc36PLO6Ccg1yf7FhONlhgBrRFoOM5NTuipQKy3ro5qJxqWdJLSC8OqQw/EZTxpma8usJctEKQNPydf/n/La13zw5EZjULqzBLoFNH65PxYnghtauLjrL9AdamaETeLLsyy9rtNpkDURiBDKYse72D6115iFyZ7UKZAY6YQLvUlrH5qawQypAmPt5D064H8BJFeQDXsSAPK0knWyti0MgV1hAjs2+6YkGJ5AOB9tQJOMSYJMseZE0ngyd2XVviTUdJ13X9uiB8QW8ecRAgajRXDCEnwPzOsxFBnLexYxHgQIDyCmu6fhCyMbP1xqHYiP8pzVMACQAhpym7NZqr+GSnEc0fDbU7aDd95wkiiJTaQwx4E44/j76ZKSLuHa5dTlW0YBTZepFK10AGLrojJR0BPT4k+mysdoK2JrIwyqA0B9KoGWCMiEzvfuPWw4ONFRXxmsJy+RvJh9HmtBVtAIDF0GvEbg4pP3iptKpFqbVEJ9I2pfVOvkJaE/NwS7VcPHtZyav7LDXIBzRpl85B2RZLZAVLC8rbuMig2JWbs+CIQ+rBlXl2xygjlGtp4gmFJ8QAIWaNOEBrcv1qt7f7UJA0cBVtMKGyM3V5BK+4uZxqmuCminBo+Zjr9ZxS5g5kWfKix26B3h/ng0SVYgyQzBf6ioBmQHAFUBY6MZubm76NigzH0lK2EWJcSbGWhpI0RbNoQAC1EOEI0ywXXVDKLwpbB3KLZn4pjitVXcOGHw2agA6dBSSN+KG9lW8IbZzCpaFc4bYyzxrTGVXkw/mYh2mcCrIS8jmYZ8pHuoZKmSXgc0t/IdA5wQhwQMQ/neAqZNJExztoJrTwZH1/4twlr0h1RTsUO3/5tHV2azgPzQpC2nPSAgmXiYfmYkGqrj4bZiqapJfW4DJkQD7AAldAVjoAV45wFFhLUzy9HYoMygycEyfOicRre9Gyi8cpTQWFgLWE1WUAH2hBj7XO2tOdiurgDhtRZR42VbvBIGvTKlw8OuIW7Aaxo/a/bMcW/5Lbt9wY5M4hdmzkuSuXrZvcPoidA27rx46+d0b+uxaEhrDgaqgi0KBGC8EFKoINeahAghLQYt1RU9WglmrIF9kp9JfQ5SOKtinnxJPfBgKjfmG3pEeU5U0FwAnC28rxaCiqYWHltHurSCh+JGQ0NwcsOzTLLmvawW6XgszVdgMp2RdolPLgkxM7HbqVxub5zS7ct7fm9ZIZAisYq183u4Gwr8KaURodIAj3EekClDOwWpQ5We1soMiPXYH7c3B8J2U2Ba3b6P9NU1RmTbJ30NOACoFIP7vsYRoP50VJkgPlymMsNJnVpMI8etd+gyRB0Q7HU15lfXeG9WYBQSWdiiud67QdIAWQUWaSZWQ4hSjwGd6iOJgukQqk8lC4EjCklG0KepcO4l7vkDHlOhFUgz2gEqAKdaNwB+4o8HrZvrYyVNivfnKxQX+KKatr2tCBnqItVNjRznPXzxes16PO4Myl9bzlcfaZceFKbV31tnVs62N7Hzs2sWOI/35jgIUtNxI7+mjUYehG2D0wVbc1GnVpNe3YMfBCzX/gD7YhKGhVUebACs4QkWpwPBIjEC+3UA3KX3OEZSHQIG1jm2pQBrzzFj9lM/HR+2pTvauSTisIgSZ8Ia+16GgNBQUUBVJDBcWQlCsGRyG9XQw5EHJHqTElwmIBrF2Q8BWLdNtA6Cbh1In/SmBABmicLCPXhrRTcVggUAxOWIGVmsxJPSntcunS5ugYmlkzZfEx2KtgktGTzLLKbiGzKR6pwCkJbZBaukxcObsLXjoAuGicXoy//kuAg1XA0cOA8rN0uUUikQiamULQBXNlZFt982aXxyq4V66AHYQ0wSBJtuNK0mc36bxDNiYWbZAwociULA4bG/I8XQEsk3XttDwea0Ekd0WWgRwcjQ52Do5GBxFX3lI6KdUtOg7RmEtqqwpQEAcSQXelK5cj4IniCsrRFYUvycSV2gjGXCvJpOjEuzFBP6ZwdAasLXodK2p07P0plRG/iSivipgv3trKbfi8Ms6u1rMqnqlxVvKCnLYP150Dzw9jvo/v39dk66a3r+iirW3nGuaHWKirkZyvNb85dE7bB94x4HzN+TqjrHjkHBbkUIBzcYghADG7HuJQfaqm26emrXfAnUH1qC8gR08PwGM2fNtvq+BR6Xq7jA78tXrMMUdtcSAq+LbfQgE8ZlskoODb3gRUtCEqoG0CuozQHbt+W+AKHj+BY0uH5Nc5AR1sHzcgNWAETAEUGNkwBjsrZI4X6IAymop2ENJduTznpjlSSNkGBAGszTAkrCYr4pnRlNL8oZIWeKJnHNIyn/qdRyahJlVXE3uxNJiZylu8h/1AeUz3jAfC6E74kTHKLb+mJ389MXuQxrbsN32SuRtEyxF7tW+CRAB94MrBL4CT26As8/pRRaP0XP/V3xbpfFYrx3O6OxX0XTodDyMkvrPMhoSbKlo37AMUwjl525PcIeGu8Zg6jGlHBBV69jCwfKD6AKQlNhA5Wtv96dPewcFpFrNDAkSKBiCeMishQlzRuuJKJb++e/0ruaLwvjzosjYqDmb4HDAmRgDRMXSroLNSHB3ZXdNquow4GDjgEDLnaG7MOA6B42Xbr2IEprF0OLrc3n97K9SSmqFyzAfOb/HMTj68+BEFZ+X5nOH2KPNRWec3vshta3hrjW1ZO40djRYGuRMuRBtYpzVUwto9m+jHrohZXAIickxY7Nyeq1jSJ4AnAZ8AoiNeasSf7l59lH69oTQbERg1HyDRKrmlK8uIwqiAj4rLDl8goAvcBARA3BFQsdjNE/F1AXAHURh1gWMjCriTRhbY2CYkxmUE884edwXprOELTPJrv1UYk/gMDcd3Pd2xao/J2NDsiqCMAAoj7K7TghFGglVkHMcEcos2duWyHGVGiZQAsSvikMRrebtef4Ig6cizkk/gRPwYQjl1RWd3dndIlwvFRRwdqleOlIEGulfrH0+V1rm+OXyhq+SY70WwF2YmhDFUPgbB1SirnsnQAgiYzoC8x5bPTeYlOGwdXygao51BtVY4PiSnx07pBEJFtP1LghDhTZV9GaJ7MLC2RzO86wr3zonp2MnKlLADtTCwuLEeBH+hKyQBF2bCAFUdbZrxu6JldgIpkHChrKk4BihvEe9uFoUkz40xJr15peO8P1iOSggAYUQMRa8w/LquUY+hq31XoJPd97tjx31yADfc3DyiPkOwG6Gpt+Y6PibEkPs4UIZWHmfrzueudMuVf3vFuqPTH1UdH1J0f8aDPR6e8YgG5w7qgtpb69g2wIW5bhW3VvzrNYyGGAEiOcSIoJCbihMcgHM8ekO86GIKlzxXaZ/W6cunqLo5pZlVNKvgfVWUhXnVKcQjy27O8YB01l99WaLNGrljoYIsgKqOcXPHDHcHPbMuCGR2sp2lbPuOAmzk7oAs2Jxlg3TWd0eRDdJQzhvOCijnDbKEcs7pqnQFDWWlj3/jmf6ONuhU6pARoNucTZnbNez6LXXsPv2Q4djVwOCId1Zw0JSud/DV3VG0ZScp2PJ++s4GgW4mNb07o+h1AgTQZcCDBWRS0DwGCmeFmydSktpDp6+tMMp1Jmlq0gyrzJqVrV8Ue24CKQYrCIMkuRYe7PpeFZNEIH5+88azY4cTLqwiFRcYJix8FbILiJYgJYg4BHQQSiavEP0ZWJ6BfSea2oYIoAbpAhzdFpcGooXY0ZoolplVkv1okv9sK/ui0UgcDiYa+tbly3DFVC0pxui0JpmB8zfa4QijJCK72YKS8DSM3YoDg5LZlXYrQEAVF8fewswCQdZc3OuNx8ZczXNcB/wIKWfwxEirZRbuahZatWUXUMRGVUCygaiYKxE3ZIAX1/EB32GxgeCYxKTZYy2pCEtsH9aFJbeSFxZcEHVma5yl8XDj4ZmPqtfz+nG+cVFyG/Gn3VlzO2Nr5k6hESyddKZTwfUcOMTxfqP07lrpU9Hzp3Jk9zy+siEZe37CxdWWQtGVaNclw3b31p0WANbmnRUzDEDopLPzEQ0KYGDFDTCS2wIs6Uq060xrJdtZgRzxJABZzNNZl/AYShK3Qs6/weMnmdcAvuWDczwYjF06qqIbdo8BUqJZRxKQWJtpUdtqTQBJiIIEmEMHkNKYOkpXMx0Tu2uaI8CYFliQOS5+nJXr/eIxqd8UmZO5aNeOMGlWfQlj4+2m0csTd+x8I1UCdYOHHul79SLfkUuaQ3DYOLaRI1nzPbPFbHn0uhj03LvMfYgK2wQinRBKXmrkUmP2ALOcgZgDZCME0kq4dwSt/oTIIxUKOEJSw9SQvSZdn5jcR43pzbwyGd2fTGxOPizZEYVxUTXQd2K85qqzx2+xlRWg6V7IKXU4cZVMWGLCDj+YmiJN4xQKV8q+cjfX4Na6ohGJBeBF/DUYpDYHjkGB3fVQj+trfVKyKOPuere9Xh1VMohs8CgqNeeIpiPiAxRSZM8ZIx9HwKsGDoM+QH99kGeXa4LBfNa2fp67MR5xGg86vj706PrIo3nW0OcOfE6N893PHdYF9vnyj61hR1ChyxQWpwFdJ46mPuH91gosbVNpH3WvPg0l3mW5jVqyCgva90Eeo7ooHhrsqrBUPsg4w8sqCeWWfHhdNR84yz5rM6N7fPAbmetNYm1X03V8+Vh2PWyP5lsrcwA3qw3PFt2YiP6gsLW5rTFGzTRtjLXc0DQi2ReA3Iq8rFk2xmg5dk/LswxmAV2/ysFqTmnsHmcclH73mHn76VVfc0ydrvueupZkKaDHzL/q3bWkJyWLjh5fnuqG68zU51FzGrvrpCmz0+tdQYi4mi5qZxerJCtpUTwmLYpUKhVTD3YtxbJntnZKKkGhGPc9ORMAnJGlORaYSPNN7/Oml16QZGVzZ97JOFj1UBS/ZCjOdfA4Cj3k7/cyQd4zSHMvrQCHxuzAjKVGfXBx4zztGh/wgwLMVtTZ0uXqEO5fNdAdESUjEkGZXbLorsp9tCMr6ABWeady7xtdBg4BuulkKswU13d+BdHNMUM1bMxjUDiapntPZ8Nb0DxMFf2uqZhDJFHBG5OEdibgiURrW1cDLEgNFIFIdcACmouMboiLWhOA3P8PqSlfpnWrt8xCgHaOJLcxRRcqWzEV3NAx61SxJ3E5cTAQiFuX+kOR160DnbuyPuzk9qDj4+HH+KhTdcFpXLisc5d43kk/tOCcWud5u7ByHwEcn8dyrG0roBQ1pnfd9ae25482XtaDtjQN12zw6km/622RWkvIclF7U+YpVbGeB69oLP1x2obNBCSCXgMdheYctyytN/kE2x7UAqQFNZeWSzRexh7A3AZ7LCzWca7BYeHucd/vivk11BSjp+93x9d01DJ3InOd27dsqUAtPs4TINWo1OrQzeegu9tblu5KXa8po8GNrQ4BaYHDjS7OFRzkipLiSFqUiALuEqnfzAYHkqlDneaRemCuQxIPU35wYQiQEFlmb59LFuywF4O81aW7W9NDkLB9dsJJlE/kXrtMQu6Zyd2F7k6gEC0cLQ0GdZsyL++gvOMmmJ1dp0g2OgB5i997ACwWQTleMGTuyD0l1oBCCvkGszdN16ckd00CJzKb2p6t+a1eYWqepJEQsMeAhUySwfVAaaMtCWPoHD4MmI7m0WTi0Xm7z4judkEUECS1+iO0lZKxWikxhaMInpD7LPNS+ZW4icebw0haIN4o/Y4iHlGPKP7kFIqONCUeECCiRxJAkVatPA4wWUGraSe8DtsanLUy7ntkfZWD9ZCjxzOP4JzTOPdsO/9MO2fpfM5pnXumfr1DJmlyNBYH4j6Pg5CRoOj3rNqneWL91JYXm6O/tSg5kp+oj7chGBcd04XEFHxbHtyoplv6nagaQOIBSo5K128LjKZtjKYLBF0Oj3lbaPcnxyUkmy76dNd3xW2mrghCl/rd8bYmCHWEq3kwFSAJEIBq9B2UngvI/ba4CVEZBUFbCsh2oczKrLyiBDJrFUUqUcSEYjFCpSmKQgLfj0Opnbp2DhSAA5Q0/DbR7BCBTJSlplY5VHvfbb93xEcFyTqdL3h4Ypie3OLLJjxlFPsgtWerNy58tmWuQ5BEEikiArfi8rMoZ9/WmO2D426ywXlA8OKJ4f4jy2IBYqaS+NNVymxbZp+T6NkgvNuSfgIyPLH+3wqVb4CL0bl0mcWAjOqb3nOyTtIJJphDIkg6DLuwefNebhOoClhTrhRLFRNJcapaZp1cxEPIQUQCjANNBVHaR4xKlVbhnlYBsvn2tKPZfRVzUONck6MF1A2lG3dujfN4gvNPLB/rI3NbHQ88dXiZFy+v8PT24Nd04enYflr3O5gPOrqdszqu9s4GV29em0orS/g8IoLzdC+pleVT181Pe0/PFS/irj8UiW2nGBdOXFgBrPDgE1AwdD5sS+OBqikUK7ztk7J4LOYSGQE3OJZ0pCaggBQLoCl4AhidAogudw8FMLcsigEUGSAsWWSUbaFsA0i/NyVJ5NKdsLEUSLdkpD0XnECl6KrN70wmhCDBDCuJ3J1mpm5dYz3HRbNVMowvNpUmYeGG/x9QxNCBAqzno1FPl0QiWgECmBNJN6H+lJodkmUN3t00OKvQBNeh3lxS/DGIrmhIsaihkciiNpD4w0ztLLQZpAnnpPsTlrtiupIidGgia5GO5z4f0fpOO8Za6oxFuf83652nufnfn37x1D1kArkPACEAmjEepICjgDIrXTMygAzIhFE20rZV2HQClHRTQEpNkfX8OJ50EtInxAYVxswc7rpIOme13/8NvtwretUj7cGv9fMX5/OW7s55Ew87xjNP8W9rTUNF0BWotLUVg8+jK46ipwjl5cN5b32034vn2nVrzAjm03yK5sg7bxVIhc/PQsyAGCgxYyzpBgIHA8kICgIH46ICUTwigKBcogMnmSxCHIAvACml8FDAwIWejtBaNs3io/+3p8/ae2/ssz+acdTAOi7sWsOTD+KrGyvfQQATTBchRGdFeNk/tBuZnZdKvWAle7kqDORWIjlUxDcXmIeI7X7EpyOM6wjwGeCXvC1NlrvuiaXd3VRL+yzB5SHYbfyBbRO1S1IdyNuMwg52vQz5KyWhht4kUUKkeuRRnH/45uaaUYNauFSpKOszccrVpw1zVe+kt471cVVNQghA4kF7UZgMECnZxcxdQ9spQgZ56a2hJYjSOWClfem+FXHsW3X7DLjOEjeva2t4rQkZV57VXPkTVdhta6ZXOKT3/dzL+77iRx5bzj6xe8Qx3v8gzlyM+T6jBt5fTmCxuFd/vhviyRKjJRyHu2SxBYuco7e/90JX1qf4+/OdXf/Chqyg5N4+QxLu0Xegz98iT+cmSsJB/T2N6AInR4l6iBYtm2AHLPJcnj59DkRtcxDRw3vkHCNEMkCbUnYlc+3ySkbIogmAtfEQR4GVhMXBTdt562aNjOZN28an7A8fPovv+HzT2stZZiNOJ0AhEUHSVx99SPcB5YpdkXB/mtM5rxbWbG49WhhhYnBOgPbAGMlGc8CcIo4PMcYh1FkVmv+le1uZgPOg0wqkJdv2DtwK2kuBA6JwUPxfyUjSXWYbDNtkuSXL3YawkP0mmK9ntZgvWvIFTy8mcevjHy+j1Wo+8+6XfZjbcdo8vfQeryXrlinw6rnkIIayILtm1F6ivILiSuiVLncC1uijJPal7ANwOqkEZSTjDmRGEa8dvhOTnChysm2AR5zRA47H/V/rDzoQZ55YHnV8eeAhPfhof+TxaceW36r05TWOJR2vpmM8GaWQNfPlpHKqgQrETw3EIceN8OtHLDEQ5/qFwSEONEF6+0+Zb5/CH718VHdfbaiwNzL6mftAT4D4RUTUyHugtDtLGpFDhoPoU8QgeX5uTzkceCr5YC0OEjnE58TMQiM7CPilsmuyMjsIZCVklDQvSLs0l5gIj3iidtTVTrhi/ZR86vDZ/PjrU5ubuttbWrN24hQFjX/zxMoAkUpJaBDUOu285Po3MyDDctltp7fOrUSq0AQQA4ACyAEg7qBXo9CrXP2d8rYwYBeSuyA3E1JTwzsNt8wIS2lCfIS/j43s5rrXfS8yVUDk8nw8yuYH50c8+aIxnCutllTaod2UYvumT9t3qG+7P2FhpyM0oaz2uoVLuT8EHgqAjCWzkcKUEMextYEkSieUpFEoZdzK0iiaoTqjqpO7ODPBlhiYoQPbhnrQSb7s83iVg+2hh/cPOtwe8sbykFfn81e5bVM/UnEFlDheTSdN0gCB5ad3CXFNWB3Hxm6jFUf9THpGrlf89daCV5imepk/UqO6mjGFCEagAf60Ddwg54V5at45DxZA/3fYBGjPdOqj+dj5U/KR6xPHe3jLOGCD1swURNkD0xcFuOAKsREPsoz6M5SEp7tsGSABz4A7co7a8Mgq54iaEAFtgHh2PSMTD65s+7LkiRRSQJFGgZWs7ZowtllFIhaPDTFbTfd4z8OH/Rvv3tMf/OiEZh8ZGCbUSJAem5f/fkq1k7YkUkwAsuulnxQIIAPx5jJ2L/kaHA1oCEBF5xjw6JjXqcZ1YPFDfOZvy0IMuEuZbkvV+Djw52DuSwICUELaoDaq+Kg+L6SwmhSuquiKmCLEYgZ/a0Q+9MkX82f2ZFYS0VKvc+qFTxsvuN+8fVJiT1u5KOyX8AY5PqjFpSsAskWOpnHpaGqNpEBw4w5cibj8FoeBrXT8lod9smCetZwv91p/Py/u7v9qe+gry/1f3T/4EB51qi0MeUvmpqV3vBp6IHggxKE3mD61BvIDRvgQbzEjzQgzYNajDoyUPdFrZFDNrMNZahbPgvU9B9Jqqq3B6xXZtX5NOyLZAheRDby3WojcRp6dx/v74ZGMv1sTBbHMH/ad+FT/+O6eO69UkcXZCCsUCrPLgoq+g0iLfp4BVxZmwBaJgaGA43YwBMgGJlktm9AeHSBHLl/YxcJlceEooCCBuEwLnICzIoNJjCJq0Wfa7V3/4tO9vuc3D/7zv7QFfRIBkvx2t+f6yQO+kZqaIQZC15CI+3D266YgU5LcLIXrlcPCkioiAasCxA3A/UHgz3eJP3QW/+7mbVVeVP4oMPQRZQjvWtOmhaT3JSkgjXfDJXEXle6ZTXeWDiK/ZN1LY6o434+gRKW84GVd8Ma1gdWVRTlWOFKzo7n5/A9btvVaUTbRwTDJ3RIIh+wPQVZCBtnIQVFCm2w0wrqaaalY3RdKeaqQVaUTbeVTN3BoxRMHW4d+hcPLe31ke/n9etDBu4ce0UOPxtmn2kXrlKycFhBKHt1VC3zw8UQXDA6s1xKz0oxqxtiANsDNjd5wI/HbqUtvURNn0He4LtSNZx/wRq5U6qmrBw4caE8OpJdasRf7rpY7vezypKMkY0xv6MjY0HZ4vMfy64+9+TWLRRFa7YWvvvqU/Ihf6oo7XaKBI3iFFSANhSe0054J8AzZ3jk8t1gln2+MnHmvEUFZrLRbxhKZVstE4wDmuSGRTKtEDoheytJlNqLdjvcPZQi+S9plZUQGsJo4WC01KurRNo3Hx/Rfzp/Ne77c+tCbDdmMScAKGJx03jy44OqKE6xKo7tEkrXLjeoCTqGoCRM74M2ikBPmhIYACqB6gDwAzLcjb1MPVgDIBuUZ5eOracQwcpq2VRYqRPMsk0Enk5yEvRDYddCZwg0Jl8mffc4sEQbVFPOlHvbkba0pn0+UYMz8F7FjDadc+v7EOc12JxPSqg/V9og0s8DCwyE+1QdXlJCVhuSg95C5jDIblS6TyaIytVJAO3/Dt7UvcbIvTUuttvw6krtsvvZZZ/CKh9t7fHr3wOfw4Ff9Sq/MD3uD2zZI6bOSxbGnvDgTQgpclqY6kNfEuawNrlk4E5pFW4xN4Nu9xTEHf4T/vt/C683IM2ItzUArtFUj80MHoGDEdD++5IBSTSNHXoZ4Wo5Xs5GncFpCRTcKU+MR5ekhzWPRTNFOW9Cn/Ec+ffT3vK4XTyHgCXhrT9OeCZC4Iqu+3RwwbRgRyIf0jhC0zRwwTw/GD0a7cqk5GtksAlnzU5oGUSJwOKwi4MQD7543GbssVwLi3YjL2z0rulWiACmpSwmwDsHntLqReZmyarRv4uZxf0z/8fmzds/dppOvmdB9Uo2ikBKFnPfto6xPK8wkUkXK0llPQ1bpaF1XyN4TpMRzIREj4p8LiCFgHHmJF2AfNoo/bQwvRkPieDeQF2jbRmPqEzwLeJOJeFIawvaQJvlNHOzeiYueZ0V+zUxRgmIyGLyKajTnhz6XJuOQCebKrGxGf3u/n3HlYdOsZ7sNjW4ZjUYlzTNkU0MzD9xltEvJSskEQEYwwkvpgNhK6VuviMFZ6W9hWnVSFVytTMIIt/xWzl7hy76S72d/PeDw/sxDfvDheLnndfYS9ks3pmTJkl31gPeTtA5+kDX4g5x1fD43FmxU31JjM22DtEE1qzbX4A3npLpcQwcMenZW5E/aHUMhOa+deyyQIi9Z3BCUnFLQuiNeu04LV4E1YndHdUBb57XX95y/fnl/8IukNzeqT9mP4VP5Q682jrTXeG0lYBFNq9Cy+MCDFHLMBngE9FLcIBvCwTIkONCUbOjbbDSQRjYBBb0sIa8yIqu2iwuQ0QMgGRTIMbiEVj3UjmY5HKKwQvMKVFaql1W2ESjFO+kVHiuQEooVEjxXg58A3csn1hhp2USraz796sOH/0vbx/vrt7JcrBSFRKl68qC31N8LI1WAMj2HlO/CWcdSKLDacbak92euii1hS79MQADMDWDcJn1uEbMF62hI1lKCOujD09NQexHUvgZzNeIN0GHkLpA8JW5Mdv9EOZrsaiRdaLYJW5zVHZ+3op3HX2q3jgSmAxVSTd+w/WHjnHSpLNMAhObixYKzCA9juxQYZXHf0dwHa0/6xFYg7TJaX9GKldKP5InHUy0dv8466qzzqQct6j0+nvfd7/sdjJfdP7/Sy8t5S6UTlTVLF/Po9D4w8X5SF77wszVOjHZyg5PQX/Kk6JvhhsQcvHUGP/6TuJWs1204c3ElkANUAZUAqoZBzmJf+k4MkBaHcbGL0yL4x+mmtjWHd1///N3y29fYewBE0bTaR3xPfMp+2KdMNiuO11gHGFbDiv3UpvIAJMN7h5gNQVBELyANE4CzKtwdUBAOJsbT58bb1yM4EdRuVd0gejbQy4EV6RCBgyzat/U0haZYxjIgEZzFh6ge8RyBqGxYcpBfLAQHOClXRhRgBVJwQeIid0B/XYDBanHkCSraTNG7/OmPz/WeTygjs6YamljfPbrgdoJ2IJPYBEmt/9HgdQMPBhXYYNsd4ejYAuQSC6Bq4PYw8vu34nyrwKabbECuzkvlKg4CMS4l9wvYtv4XQEE4UhC1ompTrzYnTqBK5EQKd1vZrqCSCe+bRm5+Lc989LNME+mVXiY1x0Vbefo132yZW1Q0EcnY1cyLBFG1h6CALEIZOJYshD5NuymTVEvWzAQO+8pI1q0WY2uzvNyr9d4eHfc72B7+Gl/xGbzcK9PWFVSPOazAyHHxJ3ccfguxwpEf5OdzI/MJMZ2aOlHtpDKdWMdf+StuiBq49bHGrGGuQEnP0Q6Tw0ZThbqujgSaOsgDDnD5muu1PdxyBV6Ji1BG2fXEEPLbJgus77H88t3lr+ZBBAaAomnphW7ip+onLi9+/stGpciwwJVePIutDUyAIGTDI6AXA8RFEZqiSI6gi5ZWskmWQ6JdwBCy6QMSINuDyBHUMSKuDwAOkVVWVV9wqea0CqCs2VJQyayyrgA1Z2HXgSApTeNFoQmIyzLwhauGY0gpAIcgrWCFlMXFwBeR1TbqtfH8aP/rcVTlxxKbuAZGaEVV2PbViZPfcBVmkVoix864SLmdQR/QiMO4O/E8IdPTkApkFSAmgOq06QxBSTZF47ETjOh9qMZCC1/QmoCdbYKNPd3kFGw6NOfS5bfsn2VhS53FRZKZrTj7JT/N69DxgMqurIbaGTeOjWNNlfQUDrdEUZaZ5MrD6XGAa0doWFGkSRpgWOETnJXwT+tfshsDtZQ7k9ynSaU8e31+T49c3vOjywNeigce2r3yy3n2Se8chhPHxfXgQ0ldfovZiI3mSaWdNozTyu60nE8gNggzxAa3t6jDD5BC6v+L5KWrifH4SbsVaq1YmiMsClZwqzrh9k1ipi1VqJwS3hhuERWWksVV1Bi6d3zyWDUjvi07Ve85/vzjbX63VYxsHNKTe184fRo+WR/xbW+iwqstbjmWHFa05wi4xQzYZawg8jwT0RUHMoDbIjHgkI1smUhWU1DIJnYgg+X0gByIehnvoXNggIqbYxHc8uUp5Pcyq+fogv20lDZiVvJTEEh+gH7bY6iJElmsLQo8hqyjZWtOVro+wgX4Rb4ky0onOMnGJCkJaSIlTSOBq2tRw8qH3eHakUYKaUeN6YSdl7MfHba0UyWoIghYQIAUpcUD33e95+ULlpoYpPkeDD4K+T1pQGdiJJjOnHZis9BW0bkaMRaIjZahgqwiNRsOgBXoVqo1ePcMsF0NKqaZRhO+rOTCkougWWomFPmlCyWmZCbSmJoAYyqUbbYv3tzYfpIJMlbETnTy3uPM3P3seJiA5KKEkOH9ogw/ykXtYSiRTEraRAoPFmAFEp8DhRWTuDQgL8eXPv11j1TaNPYkn2/08oe2d//U7hWf10NfiVfeH/d9Jbdu4IgoXDKOd2mCh0k9XEP1gk0NTqn76dqf6n4Gy0ZxI6g7JodqwpXGsd8gcoCeCgCVTlCuME50UglOnJTccTi1qjtWny5uPLp8qqUpVqEQl/IEMhCwhimMD7vn3FKKMVd3RL6Mv/v48ncXUX0InZ6S7rKwfMp+ZnwK3nttOrJSeMInJUsBE6FlIuZ3iWh+j6x6MY3PAd4jH1YCEDnrIeqCTKtpEmbKM4v5kBQwIs+ApzyznB6MSOQ5YBeRjNySCSCazmEiCSCjQRvpIhkgHgRAra29byhuxHM+pBFIAAaH2aJbCqDEnFm1tYfwMf2TbeZUxOVBJddeR9I4ISwiYyqAKz8UI0jSNEnS1SQRoHsnRR8HGQlGGI60YkZt7UU684Tqxe1IWAqXkAE2Dy66HVJFPEtJYhaI09oHxeodhXkWVDd+v9AKnhMmCIBRmDFFHO8Uj0PJuxJYI7xDg9HNj4qAfSE+ajXiWNUKgL53XXIqYW5q0gEc6r22jbyZ4TKcqSE2rEBKGqnCTnyt6qZR3BEfqRRhU7UWN53zftP0rAutGCaPzcSzOPMK3VJ6HA9lxgDnsJYFNotxkWgjjQIOTw5W9isT5SjD6pXVs4xTS4YwjK19ve+X+V6e5v32z6/6kl/l4PSgA/W9lIKL7/2BmmjETYkt4GTPJzHdVfPd1E9it8F6ixp0BioleTrI99kCZd95R88pMw1WSClifLglvrX0vamTmBBDaO1z4i7f1+6NMmnTQyPXYwpUsUvS2B0w5t6G+Ar6/uP0n53DxWIg7vVMq330P7p+ij88nTIxrUbgyLNtOPalX4rQzkYgAHNyjM9Q7GKoAfIMjarPUKCix2wLUpviGYiHg5sCqGe1PFOymZo+GEeIltGLgMcRNUzckxO9oSTBcPQCkUgGFVCW3jPfBepIb/lONiooS+bucQiitOaVOctv+377mIw4Ep+sZFcqcYDgm5SIy0ZINipyTIIEbiNJb4OAJ1mJIKsQqMaH70Q7tII8nf34bijvrEhxbdWEFEZVM/T9mf3wABFukSQxyuGsB2Xb7ZCYn6++XziWEEOFjYFgD8V9YE+xXV4DOU7km9lgvFS82byjzKEPRZJohkdYJWwdDLmzcjNhQjKFIFym7BiImGzxTRTQPqz9NnFDEmsrlywb7RjotAvezU3r7+cPxzHSa1KWIt47kYeDMi9GZAUVBSnJihXb8Rhcet1YmX4cV8b2vesu2z7wy7863t0j7ZVfaq/8Qn/pR9ojTypq6MuSXfX4EGMKaslNji3EKfQzNJ2u6WQtJzXcKNXQW1yH0NWCd8Lqql/tPq7rSxy9FaUSwCGuN+25aY8lfc7qHW7vGIcgDnECWKMqPCIHDiw3PF4uvvs85J+e6UsDFEBPEb2P7gfmT/UPtefefX1zVwYuHuPZ5dBOEsUTM5tzVC5bwDD1aApCzNm4uGGZbCSlKaaAZDuA8oAFkQ2XASKWQRRlNDcVwI3mRSCz9B6YGnUE2NPMiJibZTyBZyXH1boISnS1YNWyN0QbQDHEhQhYOS2Jc5bOyEopPJQZWMH74AM+0DT4cU5wMT52lw9Wg0IkstNwr5d3W6MApVOsTRWXqCxe4fu7/q5py549KwSTXh3SDwwcOmbSPmR3lEBMxBaACkQFYvZofw60HnR0puQGIBuKScPFBWlr6G4D1OdoDAjFzxDMYggXEU8ZWsBMbHW5dSHLYmGGSab2mY4Vsyo/hmktBWOSfdG2r/XZ+XXDVP4Gjlshy7zISDLIMiR3vLoVSlfigALSJATwLMdKzECuGz9dS1fCjmG8wqvru72v3tcT86u8vNz3hXrkUm9kTNN0VzyVCpIaMGecoH43xz20P53ltOhbHBsb5EYyLrGEHLoKf5jFcSFjOeyt6SZTbkmVUiF3M84hvSmyyDUBQsG+1bSXgxMci6t+jhxfNcjAHeCl9e3Hlb94FOfXKACR3ru5W5+mn1xf8uKbJ42UUCi5GLMroWWiaSkjgnLZ7mAKhtIMKoheSNzGmnPUZjSlKQGQQJMGSZ4eWF7Zs5jtcpLjkGA0RVwgeSNxQXXAZMF+4uLZMjE5jDVBFMtoKRQMspiMSjZAMgHWKAYgIMLFLShyICscflgxpHlF84KCYs2FqVN2fozgUkdhzbH8ZbWRkTBJWnD1yL6YtKdiMRRDLGecuuHtxCkZtyTYOi3ChoiptgAoobgF4TBisSzwzmworkcqV9Ml3dYqnEI+UFGB4EQX+Xq818k5aAMUEl9EWF20EBJkCiFe1R0BQZas+A5+qOnqSTagJOtQKBpMJ8yfN4wtt6Z3fOAwERFfAiJ5MSrLVy94RlmRDyG1QppQHMFawe0BnBjoqXkc14ytfb/sy/gE79N7f2J6pWd393spz19vqnbBLmsp837Pf2yjcNfUd+e5uDo1dic0UYc1/JrPGHlj7L9TUkeXrkkAciOYrDuCMlTCITjECRWAE6CH24X+bVaQRFZKJyMoxcVx11XvHy0dqYPeRaH33MbHv/Xz88m/G4CIor/wjdOn7Re3d37dKx1xSURRSGVxzpLVcJrYT+T4TGqIHuLlRVbMjQEKkNnkmO1CeabkuaSzKa05Wj4kewaG6YPyCGTj4h4dcxKLBTFuME9c3ABh4TTfbUzLJU1yAMubZ5gkcsqSNMMziIdMBJ4B7z3NqkBh4aoVbgC/KyW9EodIcUX8llGCIVQVMKR5TFpq+UqgO4xIQ+RVIFkMZzx5NZEOqoI2AlGchHusqXnFTyjTy5IsIKSZULvb+AIKB0CYML8hmISVkEkA5vbimIDxSbCvwDoBugZiNS8kWJQQChdtTEe3eA9JDi0UirNzL2lkyZlpJ7JLCHri9301l0iSKJrSGZJzMjWVkZqwXHR23njup9rouLGrsJMOHos8FpY9ydrivX91g3jJhxDfgBVw7RUOpiv0rwAjruY1wN/1fb/sj+d+vsIT/X4v9Vd8vs5c7MMb4yNLHM88LHsT2lz7ruAeaveJq3vk8gf8j6VPa+8/9qRWekdIn+OO6MRqnHbx0Cff12Gl7Fcs2aRpz7HUEULK40oVTg+zeHpUStPYPSfPjFEHd5wfeE85Pj57K1YGgIhBJ2+bPlW/cP4o7ng528quBb2kdUU5Gi4xrO5kP00eIzyVg0QE0EvJPCcqgNAaiSgeIacF9gwYaK0j2AFMNYHSKtkgp8tBaCoCZGtIA5+BTKsCgltkLubmphe76NSAfb9oD3DVo4DRXlOIkI2FGjUgPgeMpZXg2cUio6kXIDtIfCfNhxVLWoGE8hrxLjuyV4p2GFp5ei+fyDbR/m4VYFBSf0LP9tF5mxdoUxgsJksEGTy5G5/SUSB4Ib838vKFYCL2CqgFsG2mXXUFMzBbPmDjcAiP+KepYT1VPAFwRZILFGYicYU97eRSqDM2ZmeTX1eZpWIVkBi/YkMW0JVb94FpiPHtIf1AcWPIk2a0qXucGWsTLY3X18fi/agnkIl43q9cCU5CKf4A1WBSxc5f6T/QqxzdPjdfxss8cXu/l+rl98c5i+xag12t/HhcC2xpfFr6uTS/OPPpxhzKi1KTQdmT45OyBa1uCwKBABAgxKx0Y5r2YLIL4lhaelzy1DBZDYESkDhe6bqORlfW4J3nCO+J7eOTtmeLbADpKeaNvflT/4uHT9NHX860lwYZ4WkkxlMLnGPJaug5CQi6ymKQVyiXG4FsDRCICIqAALIAY/lskGthsQACuAHZIKcLCAo5IhwikCMCoACCooJLEnN1I86RADc3dBkhr+KCi/YsmxTAzRTUVyigGAooMUdQECDHFqD04BbhgIxMAMoM+s0qhktBWrgMcRaPH29lbS61AYJs4PgOUsBqolIgS8Ujw+++oo6dJZozjVkhmA0Pz8Y3wjKJuxcahfOAfUJVMjm3QTiF5LZp6UT8tnnjAF5o6NO1LZst1fiKKm0CCoA4E3WkS5OGcJdKxWoDCWMp2DouYIqwmWlUFl2RNWf2Bc10piZB0ZR47tll0563m6ZjLNqSngfJBBGuFF49DZtUwwor+Niz2u4awydcm68e4DrLdv9j9fHdp5d9av++HtH7fEQXrvJABEuaH18Zx+OiTs25To3pedCLZb97e7dhMGwwPSAqULaJ4yyO8Sz9/U5jCAAhdhADIhB49AZilvSAE5fuK+Lq9bV0ZuLjr/I9195BKwHkmt6G0flT/Y8On4Gf/3K26wbVQJmL286CmydLMaEZ4Yw5CwXIhrSE0jax5wqm/QTISmmPgLFwzZIDkBQSsG/pAQPlsltyFF0uksnW6I7dmJCigtJwbZGMLQMxqiy1n+ivIEu/b9sDAgIcMJbdA6fuMTZcDUw8wAzIALcoKzNhyWG1lC+cF5zzkSAUdI8ABelSxZzzrFwyTLdXuubG8AtOz3D/y82aBcwFwFJDCIGs4xtnTm41bMmlycNQN6mGLFmIFYWA6oBuH2ZOuyC1wkvRKAAk0IUkzTT8APhlaeNgkfYIUiKcEzOJZGQwswW+qmwbhZUhxMbFIRWLOoI1Kz8qSTYzMesnP9RtZ6Z7XHKamZ50h76ba2vvLTgkF0Qykdy/+tlV3y7T3nqWgklqMs8GRpNl3O/Nx4//O+f3+dTu5Z5bXubxPPtU/8SMGeHr9jeTydibxCx1MvlC6AViuWdOc4SmDhXOAiMd5XJBp/eNsgkwVgZoQCDtPi7Q9XQ5/P1eIQbo8WoZkDFxTNNuGgVNenVUJ7/ojegPLHh32l56UDsVJU3chi4+Nf/P8dP5M/sNIxmpW0FDV2TtQh7fIU1a1SKQxkGkJikAogI5Ah65ZAE1I8eGxAP5zrUhKqhkIJQ60tMqoCwWOBggoMglAHmFAjki8QD5qStOBIXQgslRNBsqCM0cUXQ5IUtcplnEDpkLimU0C01ta+ZVRFlS4nNYlUBMa7wCazjJRpRthOZZ6ZfaZY8bd6+0WAiuE2YX2ncpGdvvznrajbFZKVbjBSbsKGwf2acDpgRMswnTsBkVsvaRjN6nw1X3QPbccVeoKcigOAg9gD1gp67UM/A0DIfRIEQImk5VtjRtfAhxsx2SuL0JJ0xsCDszmtUmMDWLViIQEYvLJZ1AqERW6oSvjLRshjAitvNYpWVDd8y0H+odHe9P1rpjPxpJhlg4umWU8ep76ANRVt4ar4+NiGPfEZ8/thYc/XSM6hGnPny89x3ew8P10k/EKzyGc5Z71MhihcUBiPP46kNsEp7bevGIe9NOSM7AHgXOcSNe0AleKx4Td4GuNmIouxyNORzSnwp8UKwBzyRUj5ZnEiqeSaicViP2VX+Ry610J+V1mikqcd+Cj68+vaJjnnY1i3sy02mfkp+YPw0/PD3XnnlB00h7HArj9shZlSQAiywoM6KSV9QMiMQMCoJEngOsyAfYAxPs23JEMpCJOZJFIR0AQ2zOIR4EoI4MPTjZcFSGCciAKUkOgB3AtCG5JQKZpuEt2YQMYBH2/Vu7olg9Rt+MJEZazc0xuhCsLQOR1v20CLIAOLsCjJrtDs1IemaKZYja2E/xyQewZwJRyTESc8x4WqPuCoUvy84VlE6yEW2yJiMYLqqWqKDIxNVkRiVCHnlUecNmA2kstBWawaNPsukAYTTB1160B0YgkBXmvJvN4GLaTXQIF+8EhNRigiqFcLddmz+IsoksBVMKFUJFaE/JOKRbI3mT4M5kYwD6yrTDGkxPEb1BU3mJIJ6K9vDnJGb3qTWpnpMghFmGx+Fb48O5gHIZ1QbhZ7Z0ELBu8VmHtXHn49y0deHUMmLxee59LnjvkbJwr26sXVXDPEnS3MrhqSvdwnFzXoOXTwx8hsbnrlw+znuf3uO36xVf2r/vp5/POha2rsjwIwdUoKUVY5Qb4enwRTS/ADotOJtIe/kEHXLC4pLvN6+jxCLvPo7uHbeVoQuHV+imKFMpTEMr0Ah0Jv1dEieumTixaapAn3CEN3H+cAkVQKzkTg3UaDvEV+3y4xyuD6g1jwKASG9mZPfR/cD49P9SPvc5+zdndyQxdaXDJK0AFrfAlZBpyjMYWZSsGcDyKuYD72XNz1dXcdpPtE+w5/SeoJkMK4krR2k3agbk1UtDQXhZpqGOJIn5EK3zfRU3OEAGMpbJli3TuorAIb+nz1ZRn9GU9/S5Oe3xXBvYn97aMlOC1DMSyXhqGM5vXW+8CwFc6I4s6XD0mDEGPDoKDNzTTE/Jz4FUk5QhP5WXIRpM+wk+QGFiYjjm+Ek+xPiJMsCC5DYMqONlZXWHI+coOkYJCO7m8TTLhAqgasZw0na9jJG7AoGQxmFpqX03ikgEyZxzlMbm4T8twXV+6xbv7oI9pADXd+IpApGbgdOS3ZraP86ZgqoOcgiUocAYiUKDr35uKmssuQVoG4IMP6wF0nLu79Kto+sWxMXiipEYxQh6AZnY/3KnrIWEotmuGUkiEoVbOPkbNrIIyPa9P1TWqG9OmOWWifZvMyGtyL13DrBGvw8+y67MSvfqpbL2kGBF527Pd5PEk7xjJIzLBJ543bYB3v0Tzx/nt47v4369/FPtrJMZDW1xUSAVlKx4HXzaicLzmC9Ou5fmLQ1qgjbGCsrxKVpy4gTitJuyj5T0TSEtfXwbxBJ6KmIayoPrV1vVJMoa4QCn0RjpTTvBunpeGEgmYilxThyFTXIj3SgoKUAnhL01aNAF0V4xzh9v5oOYVILF0utt6M0fxUfXz8Q/7s+z92pBrXeVAU+LsIHkoAT/RHqVBfGR1yygsyWE0q1Z70qVDqy2vWrUQyY+e6or7BSWoBRFeMG0n5heYKt8ujr9BshxRS14toPExI2RJmA2BdDkhzoOQ68/KLf5GfYTr9lBoT2rGc+MOyAgG4KJdm4UFssBXS0QUNjfU5Ng15MQoKhgOGy/Wu8cPYTt17/LoStXgAj6hN9wCpqfdv33RX8rg911/ZU/6+HIy8MTibtela7fciLL66srZ8njlb9gNvl6sWRP89UuSQAynhrrpApedx2CK5ISDxxZ230t4nHCkMNUTSidpxiRycA7WS0KH0UU1D7IRl9wpkn9NIVBfIIYI4JuLrktfed3LaSJ42OVVDpYWOQPAWryIIVxBV367bW4FuCAMVF55Uq6Y/zc/AEbAjC11LA2GTOaj+89Q3FwEdhVj8POoMl0DqVjCJZNWBwUJka3LwXV2RJcSy5mgm/BcLHSdvZSn5v5vt7TOpIkiABVVVkDQXwmvDodVlQUrBLHE4knspKvTAz60mjWVzny/Ln56ul9PO6Xflyv8qx3DGDMiJLCoaU+Gozj8ZzzLvgFFS/k+e60DWLNFGeFXIegryWaW1EZh5XA4bAvxRNDSQldvCfEcty6LeB5KRKs7RSQaVviNXE9V+au9JIXrhyMelNxmQHX0ID7vuh/eF8TfbsDHHGiCQO/9Wer3nuc31PdznaoZEEM0lO0mY4+4g/Wp+8Xlxfct/u2l0VwPiskzi0Gj3dPLQ7EKUiQlVwd2aF003Zbth+IItGdbDE7PnUhsO1JZT/BfhIvr5U1vRUBwRKo4Qlk7Yn3G7w8AXXE8iyBJN3LBEVYaAeFpBHcxHI0wCGy9A+RKC1jzWAdurJH0HsS+lLQ14zvJ5nQaglhhtudDZ0IQJIyBEj00mnerkO6BZeOpN53NedaizF13e227DjuPpBh2va3V0VAytQIwKCTx8YVgrO3JydmUngKbwSoSENKKHKLV0IB4LyriJcFqIBh1SQrC6TIKKQovRMXL4axmEZILpue05YSCBIGQGlXtvPmwUSlX9puKVbMY/sehNGZAKZRmJrUnnQxCkgEjfYWup1L1gOZL2rwoG4EXjT+XwdWDak9wJ9RpSlAeENiijDB9JKkGZAuncRb+RCMM0nRXtkauArXzQnvEgShBBGEzTaZbPvq7cnbrRi63demmTJzgX5V9aN0v0JkNBIvrz6GCixIMYnbj6ynqyyvaMlnBtbI6UUbx3f38OFz82W+9GPtZfePC0+VbRRhSzpLXbKbpK/hWAl1fK8cL0F7EeZTotWSvjieO2VjShypWDoltWJKFFzpkkoKAcdit5yrcCty6OIXvvVp85Wf1OT0NtrZutoOsaoK5EN2QXnTCpk+5RldG5qqlI3S4fElXVVoWmFKO65KN4VR1s5aFx7fHvHidNZ9r2YHUw1afJlGWIDUiBqax/eP9T1XeD/9usg9gt5bCCLX1Kr+kXyAn/5f9ju+cmeZHlNM2yDKwDsDAXrhw0AJhP+cVCelHub8uMrOUny3PVcDI3MN2lVJrSuebescAQltGJhtQui3/fbY0R/pGKgT+u12JkELgM6oWLC6ga5KaxlG7gFloacb4OlQxw7qKlVYoDWpDDPKTDJyOJ9hIyhXjOl6mU2AnbsJuhBub1l21usedK3d/Xdq5u5q/V1a63EetjGABLDhXr517KiC/sD62myv13V2nzxogXtmnCUrdpuvbkO6+RbfpBAKNtfQrWX8+pHWrt/2HfQqe+LK9Ctec6brOpBQQhyIAUJ8o7cgwssaMojwcAwBhoxDiGlaMaQCyVwGjNqASIjXwvLClDQaJFFNGGyn0YNBkJliA4lVpc03Tf8ZqCqdWhLvVt0uJZffwylTmM50G0TiTOCxDGgDxEe02CXo5e4EvjcbgGO5q8HBMfAfAR8D6XXufmYUTlagR+ZlDpVjEiyJ6RQqm9mxzaCyXfbLmqOYYLAP0V9AsU/hnNdlJt9v7s1JNaa66aa+jG/qU3HTTf3YIxYWRfHqYDhFWeDflIFBsSYK2rmVBiE3cOfg/H5ePH6u/6He90PjfTzA3140SKbXWWgFtK0kjkzSGeHurncUuxehn+Ta6/OMo2OBvpYol7Ii3ZSo0IlpJHccAyjykXiOTFX6OYksMN/9/X/yzn74/zRmj7aaGjSbTTehUZn2EeBJq0oYrz7+OejGFkTiSmGLdUVN7onXbRWmM+qdMdf2XJXbTn79sX70X84cfNUAl/Ujl6XVAIaoowsrvlK1vqe8vNJgaUgjSkB6vbnu/OF+V34mfpMveeWVVT+YZT9CAQNqUrxM054yA0DmOAC8Id+ltbadC48ze/5xl3r2AN1sZO8SQl2CFmabfguU3WxkZFZmSZcKS77hAtZlYJaBl4wvUwgLcJC7XGVq7l6nurJEhi7O9f0c5Z+gAN0IE7VsyzIHWLEnAChLdFf1TDfBfuoooA4dlA5mzakrdFX6hMfrcnX/mwXgD22zneblvqpFBMDpvjNzQVpPdIVu9PSrXZXM4moT2nk4cIWzZTsf6OmB28TXy2z3lb8hRvIU0ioOcSCOQLCGgWJxzWLA6ocOh32XQXVnEVGSJs0Y3gnDCnAHrxuUB8mcBmFARGoPYIkZPrx2uw2U5XWnZmRo7ArMUrsu3NXRQzOWr1LpbmVVJp90eKCXkf0A6Lbnq4nmIAjTJSqkKgJERfMY4rvik4NuHszr37PND3d9nq8JnZD6tmlemwzSEIE52IOsnBbmHCCVJLGCcBNMAdgt+584qCx7O1nzAIqT2YkFTQhZVrFiE6ft0czUHHV8nIoJFe2ayk8qqqoCn2Xtdpa92g2AD6TAoFK2N6b3NUVqnQ88cfhcfv7hpZ9qL/2wX2Z/RX1GuFBYwwKXCsF/m+5NvQP6i9F/4qsaoRlKXUtAwuI4XgKwQZ59C3dIHBMgF+/phyBY84vc6NSLfOgXp9+C2mzW2qEjFNob2Up8jKNp6SnfvsfU0gy5e/LBxsbuXtOOoE5fa5y2XpXuG0xf5A9x5BZ/ndQjDDxTfJnO8d338+HN3iKn5BiQ3ptvHKuP8RP16f/F/kLnL5ZZNCmvWXroIDGBeOzEgLh7aem1vc+CLYQw21Q5j9ePf6P8sX4tpvd106+h/NpZDYo/wY5SOVN2ttf9x48Vhrqz/bXU0ZUl2msGaFfKuo4fAes2TM7v13R4eWKh5yxJuk1tuO23b6nTIGj3DwZw27V4obPKjKwqmVtquM3tMqnLNWgdi/r6VG/ur7vUfXA+haZeym89+eCN5frwk8fvwvbb2MH3QVIqNUvVLUIAMBOoKwVmiVOAmgGn3wvpdr79Y8WJCmxDgC39dtvzcbl6t85c1dFuRz/d7FZO+lZYWYtFikjWqMCgGIsHFgzQIlAxoMeuWpuqYrEvIAOKLIdGQ+KZuCbIAn539lG3eRqm4hUmAaFNoG137synnXIhg7gqx7DdKDdjs3AcPIIexDvwPkhQIBCLTLS0Hku2FuAsw3uLuncL1gG6IKlR8QOFm8XHEZg95ZBMz5mcGWZSHERUGwlGiyk/jWC5NaALGAsihiQJYa22zMmxl+TE8U+zLVgql3H2WEEsLFlaEBFwFrxaQSjgwFcABTpdD2qr0dx/vI88f2xfHS//uN7tN7lzPRTjgIPCJWlABdPTjXcNXlTzyTSVw1t0y9Rp6Q5rJDSN4fAYkEUBhXL2ZV6jMSCIAySINBKbZp5P33PZNLGzY85JZHqzUPoSX4Iv24wgC+2bLRCAxABj/pz/eibUMGdwATVQR92X5/IyI/We1rVdXTILAET8prH4VPx//uOn95Mv7jnvn0dRrlMS46oiNYhl0kvojFMlTIU4CNBR5+pQoah0QYVcmAlyO+M8QSTN1IxVTENHCNzH3qiCpttZSDupqfIpdIV1aVtfr0tQxvV1HUksXr9fV1W1421tkl59Cl1hHUK6Kl1AsBQ5zkgCUGN33B7RBnRQBUWYW1iFJWSX6I5DrrEpojR13HHfFbrjlRwV6cqTx6zL1b3SFdB5V3TGHrmqcnTeQgINEqmp6dhVQbvC2BWfGfnHqp65JKPZQ18XoMxKKfa6bkiW0Mm2XWXWKPfeMqVH+217fQhxRBVrA2I0wFuQD3IZ5EvtYiGCOISmocTdBal0CWCf3RV8lxkWxiAFSBLC4WysHCzs0EREEMJGqqOhmwVFORRfIOwKs26CBbmACLFWBM+r6ovguRnYFABZ79YwW9KpocddOC4zvZAUUlimS6Q2Uoid3dZkMDZnwivgkozN+tGgqO6r0LeDL39q3PvmxnifhMXMl1CVJ3ifGxkUZLzIGs0A5zyv1gMEK1jAYt86MPnSvL1hfcTy+jn8zOE93lfv7V48+EA1sluqAGQ5TTEgPY3tXdJfiv0m8W2d81gJxlSCEydOmcQrxxEtWXORIJCBsGQFATo7WZ77Hb+uzU2qQ9WSxkpmxQp7x4UvcgvxMMpKwAlTVssJxDVj//7utoYGRkKBr4Na6Tvaeh9s734wHpT9SMtiiEHkze+6Nz+GH/zvn9H/909Pn46n9XCU7dgJcerjYBz7vDGK4ONCozhgAZ0Vih7hyLasSSOFbR2jxHzbXYNZ9LItplvkSY7HK9N0sh2KVXENpaOsYYJ1qXuVbm75wfi+Snk/9JKW444fzpIk8mRmasKndQ2gdJQdVdJRc+biq+dqKTS1Bl3qrdMMpQMK0JWudHKed0uwxYGA6KmrTZ3rqmzOLbvSFdonukKCKiZOTHQFOso3ACNNa3aFpL5Jx7rUJKWy6UpX6k5h3u2GEHIqhtDsgbqwBYu2M6a0rjKr9fszqaOMp70pYrEbU+1BBrsNxIID5ASL8wgj3rPL1gY8wCgDsLCJiCwwizG1IjGcuTavvEuep6KRW6Q7dFnWv9iQNQRCkGmBg9Xu7Nlld+VzdXYiEWxc0CXG2fmSHJK1p+GH0OrVB/zt6l03ZydEDqBIBO1AXtIUBiK1CldG5+SjpKG4r8J98wTOGJlqbYi2wq1NPJK5mdn2edICnVQry9aNuaJILrXotCpUDpHxWKgqa/RBRErJ3JWvZuBQhjykLSs8+7F1oU5aXT6+xx8/V59b38M32is8jYs22N6tKIfHrSYr/nS3d8X8wppOtA3ODT2Chq2nonVjQEuA600ldoetIhONnpCWrmLJqRORJiBisXYueNHj2z1vebt5UlHhHhO1+1ZrRgqaZiMu5qqS3S24QebKHXWrjHldjarLptKjxuPj2ri8zyG3w/37WSz0FPFCVx4++h/6H5/un/7/TxnPyO3gqL1urRBnxG9iBGLhuEkFIbWCXArKwIJgdI6BFJWv3zCmg3Ke1bOKfCXMDvPA9rrKbp79Vhk67d/TVO+ufqAp+z9CnXlSm0O9StQQAeT8BwBCR+W8la17neeenoKYUkegC6GuO+f1rqbLsAnJVh7XHT0fkHQW5Wr3/g/mszGgCnSmNYOdmRm671UT6fSDPwxdeb8aeipn+A5X5a2eeXoux5GDXF3FKvNGH1XUFxv9pHFzz+asiIpskPW9Iiqqn2y4lw3C1T1d6RT59z+ulh8L/JDVy/132FUd3QDc33/zn+j69Q9Dzlo+2bQgwrZKMJ3tfoOjzoym2uNcuapz3rrdN/9/fvk/dtuZse1sbT2bW0/Wwkbt6GcjYe3bddu1UfxKv1uzI2N21JtnY8tUP3Fq//X/U/quEQeIBTjX0rIM0eISFYBDpIQyY+kw7sr+f9xdFEIG3OwKo+sdF0gnwQlmOgzDibO4U33Y/6SF+LCqKb2kC29AVTrt7zNXEG4gECEUYxDCFVk4OsBK4ZW2zslnQVgeuVIeuaL7GwTGIsIQUZ+YMImFStgL6R+Sb4MVCGv5qVCsZ+X6j840kAwXntMWlGmheshyiyYUM1UYWI2UaC2VVsaYpU3ozqoC70e93ih7NQvYRQE3yCmED12T06eddfbD5+Sr2yf4db6Hf6iHH2FUl8U+gk4JCGmWnVj0Dvn6ncaP7jqsGrREG1TRFbfEAmMA18O1nuCe2ZkgFQhLuh5gDfqLJq1BUi6gzds/bFnA7Kg6f6PdVt6TljHd7i2GKm+Js05Gl042yjJGKnQFku8NhbgPFFXIjVgPz3faKxZ9PJvrgxwLFiWLRRRhor3r2777yD7y/z71P/zrk8ZGNwqWNrMtOgIr8cTu9QsNGg1La7a1dPPyVZH41M7ehh3jAAWp4pWezxvl3XnZVDnVNNh/qDp2lrU3zOywHkJb51E5PkeVznu6uu7f2H1ctfF/p2FXy6/Vh1e/s/O4KnWucPor5xnCmTAJ4XuPn3wNyPYpu5fz5f/8P3jrrMymb1yb+vr9U5eEYXj55IADVdP/v2oek3297tT5QLjdN3fzD8aQ3tRm1qmuOk+7OtbT3/vy/GR+m7kNef7mr75xfT93fe5SjRCubP361/7XYeetq31z+2X78Dj9sJJ6W4L87lvha9W5c7x5q/Oe4PxHqkx9jZ+5ZHZcdTLrg16r9qtvLHWuNz0/mp+7P9Zx/wPGKaCq0mnVcyNoneNDd70LoUo7y4LWmkvVnW0qnr/5XwjdUNjvj/Pd/f3syBtH3ricz924X87k8WnQ1Rte5vLW1T1vbkLzsop1htD94/NbnV9xX83WeXz6U3dSzZtXXU0RtvMB1kfqGFC2b+ypJt3vpc0P617V+iu3+Xv+KX/PX+fv/Fv+rr+bv+cf+/f+07tty5g/i8aA0SZ1jeuH4Uv7Hf2u6G7Wx1mbjbmp04bdly27t5mx4w91w0Q7cWa3ZarZ2J5mhSJ9bdYikrfs07waHgYqxlmmcGZRVmbNWq2FT7JVPFJtf5IrkNKZj8r5N8Sk4NSpWAU9bet7t/HhIVWaSd/E7GCn5O3PdCmbbZqw9cyqieoSCjAjVAglb2ukrxJ0dFobvqS+odci9ytgNxSawB7T6MI/HqyENZELnJacmMvEELQEBDQl3ZeSXyuzSKoXMuwJG+sQ4ZzULi7fT4Ki9sj6pLLw+Di2RnOJ6QOI93hfWuB+aeIO4MDiVFaMUAMGRt7e8/6Pn7O/2d7D19vL7Y+tq5tJQOmIw8p4z0bpRfT6nfPDe+VNnWZoTpFWsTJWEVfcgoADcXSstPIEk+494ekWa4VoiV2VfgVVvwL6Eu6w4lMWwBmXvN80jtpo6Rg6tHsldIu464zRUF9ZG12ukXO33NqJ/ajtGOmIS+kRnu3d6O3qrfNsdam1eF7BJ7Ae7xNcRDTQPmWzWBRRmap/FB/4xUfxoZ99zB/8dksPPmrizlgF9qWkKckn+D8fXvnhecfJrbbJNzSFupRpY2BQtpYYwNHS07NANxhD4HgFUgXLxFeb1/U1P3PzfPYuP3fX+dzD+Ox9+7m7/dyD52cunz919wd//t75hfsfP3XjfHXezij9bGTeVYbJq8CA1SXdzpqq82/89f0v/tq+8R/nc7f3M0femM4u+uq137vobEb1RHo1b+YMs+Ov3O6bV605u/Sf9ckf/5Wv/VedISBi1oA0zOX/8i/9/r//tT/hZ8/3P+36DP7B2YHK2Nemit+oo77UMH1zzpvnefP/7vl51dc+/De+7c3f8JbXP+fJn5pNSt3U1KrIv+7X7/4l33v3y3/2c/+zn01mF8wO65zZRULyJM7i4atVnvr/DxdWY0B587x/5eq85QN/1mP7173hM3/Tu75ZHdaZDf0V/7rf/OBf9dNv/et/9suf+o8PfG5fP3N93rjIbJjNY5apk41/8rjUZ0LP+ON13RGu4/rLVc/rELYdrWHQQ/z+vJ1C/YGF2eFVmLP7+27x1tk35/GLD/vXv/CrX/3Zh/v765qb8e/9b/9FH//3L/3783NnPts8/uq/rxoqo6H72//vN73/ld03/7/zdXbX67/gK69/7vMmFUAhRqo6jTXsK/W4xX/1T/7yvzz+9j9ef8vv+rf9fv7WP+zf9rv9O373+Hv/0bf+Z8Itn/m4Ud9An+cgWhpo0yqjzrDj2+zC+ZRLTiddeTnh4m3z/OXu26eTz9tt6G69YMRrL9eJYE1nbaDCAsaexZmF7WxUcmUhMThCVJk2JAiuY5bVqrnNa69Gp4un7Ngx1Z5qw/6s56xYhTDR9mrtIZhCZgFbLoukEAt7hsw6BFWcASIXCZV065uJv8O2On4FeXNd1xQEuNjQeb6M4hTVx2yEUNgG2O1UQ/qwWv20s+3dmyhQuyEguHG90fgisSeRZSlR0HBa4TJZ1cxSZwdBqTsT7ekcNI2GoiAeydyjyUF7elscdNJAgPEbTX+U567VK726f/CJ/SNOtB0bIQ2R3OUQj0PdvhfxEt7dg6VOOEu6MPYqGFMCOBGmUnK5Mg9bseNCwsUcVkOWrCK7vXLHb1hXp3tctta3V2PE3T4W20A8kLh3DYiXomy7fhGWxQqApSJjQgw5+R9LlYcoPr1M+/7j33z38OYUCUUci1uEom8ebx/Vx+tT/L314b/jzUzVlIZNHL16ELsxdDVqgA32Wftvznz0bqM5I9VQHYX4WqUiDytQ+d44dQngYhkA5LSUNdaCKbYj+B+aidq4/XLKntx8ZW3avm7YcTph5zhlYTpxUvU2UfIhciwYU4GnukkHtTmO6pyTH/nMi8ZrUa+jhuqBOjTmtQI1aQytEiIjbmlLo3I63unp5b9x9RH96qf66FRVGNyi1EKZAhrw057VzYPv+2zTWtRBPX1bPWQarqSr0p1au5PEV/fGkbdI2tmdT+384NxFGpanHfKFSNQMe2qNFt/c74u7jUPWXOvrj9WSxB6sSeeIBbgIDLrb6S/5gdO2lZ1t9qq17jOm5Jqw9s6luGur3/fLX5840Jw5g2rQIC0bCRSaisvFWaGXxkpwTixsA4s8RRBpTZQs00ErVsmbI9CgCoXsaLzkj3w6+9h676v3GvVE8oYvO04u8/fdmiFNUzVFLWDgk23WqrfE/oG4sH3C207prWzL01gB76ZtwMUySZ8k5X7bj3OP8cwX8agX+9kv1tn7d+ce4EWnmhr2Ot0PMMhrDOCxgHgYUR8o6ne7tN/2/JuG0YicmeOWCx/vfvvH0299e/o5Pn33i02jky6uhnsshormKUpYREZZZhRCuBq4ehTHR+J9pTVKdOiEyfiIfkfzbTglyZHq8nrme/+PPPv0WBgwahzkktmRdsrlPP3aZWa4fJj0f5WVdoO0BVc4FCQ8oK+CvtwF5xuruY66Bv5nBR5dAbTngHVBtQXCkIwyUpqwSRpFO2VpCu7QCN2YuSqFoyYNcBrLpiIokeAoFZmYCk0DedetseZlJfe13M4mbWM8VfU+upIAxJRHk4WlK312G3TyVdamNxja3gef4Es/PT/i1X7Omd3CsJBIcHhfTVorp1LP5+kM7WZSGmmiZ8GhGy28XInFygg8IgBpuffybpfDGoWLA80qnAymCYo2s7CddOV5blvqAAzCUMbIkdBKPGMLZDwp4gQnQGvsY1wYe3SDB8Xpc+Lfv3z9cd5+jcgIOEAQxXT6wvQp+Ln1U/bh+R1eeRvZllGOpXu5lqXbGpNbms62YfN2Nq82wBloIt7W56CMQAoF5M4hggNZ1FRLpBEur1lQRBzU+Dq3ezvxPJ929ae73Hx/yoW++46bk8dlNW7YMxysFBXEjnGniht1RbC2eTXTv5pTr8N1A4q40lBBRy92iAuyMgC5ZWfsHvnUiwvfxMnnzZ8c/kAreJRs4CQUhY+aYQaaXZ3mBsuMVDPq6rlGmTKU5KycxShZEU6GVviT1PKqXmY1aDonVV2KcFzyUVSGWeszW7s5YhbMiLlBhUylpQRHHEQs5XpW3OpuvJi62zq0mvQmXqxDZW1svZjZujvRnkVvqInMCLLiEOD45cc7bnklFwsCKUWAOEBKEWg5LJw6jYIFjCI03/HGsXlhDYp2TdZLyi/Opq2ltnn9BZghapJBhlDi5Q7B4pZYqTbYNzalhs2ObgUdLVsjc160OV7rrOzRlkSJ84/xIU/HQ5+eznwkHvl0bT86meFOR6uhvpfVTEtFy7GkoAkltAajuex6sV90/xcv+wd/W+16uNf7f3vPd799rkuWe573cq5lFbZKRWohDjAk1oYVEvwiCzMpszKTEm8NgZtHsLsfQbpBDJjrzFt23t/j1v3fK3LIZN/UkNtenc55Zd6+erm+j1b8mDZNb+/oE5Pr2B6LOua73rpjr5LNDiXCyWm0UF1vQ0+m12As65nyzQIMm5pf+iagvftXC0CA0V88lUV58iYHCv/xiUIvRAlWUw5iq7hMhgkAlgbDTAUUZRdVM7QSyydkUbUxolAHFo6Q7T4GpzZBfMTU73SuZfHoQWNDuQiVYkIVWKljzKdbj5/2g1/3w44vDzh0dcFaM0priyYiUSy0YtlRgVrBae73iquTNBtY4DVljeM3hyQ2iSjgcfT6667Xn1iVSSmje3tKHHg0VotAkEs40rBP3fe8ab5mJhGWV9qRbTEyChOqVhey7BquAMpMoGoR3O7Ldt+k4dYBH6zDy+XDThwJhY8BekJ1t937T80vXj7tP95Om7ga7i2KYlm71kaSjeO0Z5Pa0k3MEjNEHdbRbbmwpCvJp/TY9SlUhzFovwrWVTNMM6s3jRdefq0WaHb69Pw/+v3db/vtCXv9Ypd8NtOhEixlVVOJKABldo0Zr0TgWXWrrlZ31GAd5HviWCE0EJdL2XZQGsRVpZ+htr56df6JUMMwHatSCLg4VYk4zrRJhP+uNeLx3xUDVrRoZJVy7f7AAaoEWHs8Q3uGblRruq6l5NF1GlqjbKQjDdOPOu3xs7ge0THEigzJgYEwraFESUfCjcahM17LVMOIOJyOzbSmOnrcrFgXNRIDY2wAOOxzJSQdsSrjins8Oi3GgQr4Z95gpWfJN1j12ZN9rXgaZZmm/SHGNVBzGDiwQKkCPcgK5db+u+pmFiwOMVDE+1KMYWii0c7NeuiT9SqP7l/l88s5j05qtdfpBmmMDtXMSglpvIINsGTsEx1m7Zm/HUs1YG9W2+yxqwf8j78937l/4Z/+9X3u+fjCV704deHqGZelFsSuYCghWUm7HvDgxYvzgBYoKgS8B0FbtWj1Lj6S3/JChw0pso5kFFuEl/7UfNHmaDRj9zQ2pc10dcZ1l/zdZHi8/5tR8begeCJuaByhjTYULtbXNL59HVxt3YSHZR0DbxagboEnTwHbAYoVhUH1sBrJNLu0jCfa4RRwRqd9ONkRMJKeqevvzISZmXDGUDUksofFeOesuHkOJ2AHqoZljYjfee2SCJ5rsRxnyByuKApXOLeEK0CKst3WMnFM7J0Jdnfm5UFvzhctT19m3bght5SHcsZFERPeYnODezGfzq7e5HXXravwsi5aj6WbxgAClU1aA1OqQxQVh1UNtBWsXVGkkKRhF5Z0LaWU3jULzrtcdvw319oipQhKLMZxephqfAVyDe2slDJrlx7oEtl5TTCJ5A6NtjXe2ca8yholFgCIKDTTnl/ypv3H8ImPn+4f+8KELBXhO3zDBZHQkqxnpBCF9mc6qaW6tPzYGtCFGqGMZzZLiD+Ie+YQJqICHgv8IsFdbgWVcv7fB2U+g+fY5s7u7/dv/8qOmQ/v8jd+e+Jtv3+Jy36ysRMmUmkMhh86ECusJW2GtGzZBncayeAa9u4ZsQpVcZRGuvAEIFbkejCgUeIZ247fnXt62r6Vm8almsCWujMCxCNgdM306aZhDRriTmMb6XrtaL2uhk4lCmL324k/8I2iIyStrBC/Hv2JdUWMp8c1RV1c1pLOMJQOSjsiXGzTQYnkN8ZRoPV4JZugj5y3lbg+xZqV66gmmlBlAvnYNnQmAVgBFVyOVTjOrxq5RwteUf5gnKkKr1dDBtXUjaDcrh34aiCRZUytVjfrlBErLRGnsSrlu6N41RA1KUpYUyOHlSFWQple1ql8sW3Zr/LI5ZX+6sXLfWo3O7yto3aVgIE3Vsq2QhXEZoWYEAPhKJ126i1Qihq0Uo0R2RtYNw32r/if/vpd3/7uJX/5T57v6tdn7JxVxthSStXzSrxz6osjgabC4j7WpoLMtT/xJ7y1DX2ghthbPXKNibax20/a9/Eu16wfSEZ//ZDFr/K584XHx3zjRvKg5DPdtnkur/3zC64XU/FITv4y69sntSns0yBQ9KDtp+G3Pgae7YXbs14dszwrwMMtxNUYlR2wICxIJkWX6iZyo6ZGFTM+l0/tAFpBShK318x32fTiS+sEMTvsY4bc2HircOgeKdepStuAvoYsMRsalKaTwUnmNEm7jes3PeKyKzJRpMc5WLvyyrc8VuP8F7nf4d1ZJ68uWmsqSzvKsgRoubd4LrcXLNebM4pSYpUoTYMyhIBOWHERxKCFPsQ6GYjjARWPRgcCMFaWVo2urvfOp+8bW7Z107Jbu7worJDGyNjTtqYQu87NFK24H/dh3cchRMbxzFnyoiF2qGzTrFfHYlFIaz5pSp+in2wfwXvGR3/7m8jjMddGYEhBG78GxKkfNzKrtzCGtka74zFUTcDRCTcCpIxNw7AMtGBEKG4FpFge1ny0xOYzy/v8pb+/cOH/fkf/8vt3+bYvT52adJyPX9kQtbkcQ0gTnj5fj5mCetIgJY1XUQItbmTpWEuDVbdHMRpnri86ur9g2Xff1aMC8XG8NkJA4yk23a6pmZCBRsp1yApyeEKYADcDqUrd2a6VMDWMYA0fOhy4qlbFJ2GswepEIWLijruRxa6FqakctYJP4pu/V0CjWBrNppUzcMbNpPYoYnJ4wuLDXhk3KSFZRVkpj1bHXlLo7XNXG3GerXicZyjWaTPnogzhZdq6SgcmLSV2xp20Z+laVl5Vg8MAsQVBpFrNcVsXt5f91uW9/vurix78iz8M1k2EMUNIlQhjOLyaH7YBZaTJIg4n4qgIV5Z1IbJfY5N5/r2ffzw/9tfe+T/93YvdPt9770td1ihK2xFIpnR42qUlTmhq7WoIFcMKsMTIeHTicQ5wvKY22z5/OJ+83RHRwM8K4zs4ob5+pe8sO7bMMe9rrWlmql/3JyRcBCW4Cie+FuWvoDyHlAAbgpKun1TtPw5fXbvmkw3rmIASPNxJu2kDhS5WIQqUdsmkQQuYxpPLzt21ut+gSVKmKnbpNp4uxqypJ4KQAGmuOJ8PrMOkaochIYBUaB1YOCaUxAhiAYDD3+Io21Q07RyJHP14v3PE0CmP5KK0vOrR3Vmn+tnHsGMrWrGWaOqPbAJ/gtOaOdEEFqpA4I5rATIWu1IbxL6YSJxjBfK8qHj0t5L0UJFZ9btefti09zA7B1dkBU1vMIlADIWjACiEpiGOHW6aba+tWlBWASAKiWJ5B7dcffgffP60/ND182xzxPaJRviIlQcMNExwIgI9djfMpxpaHSvJoHXx1Y3xEuMYD4iDWAl0AjhxQMXiSW6k642c1LXNvPo33+NH/9oL/cYv380P3j7PBa8VTzW3BSUaxgOwYlrebuv62teQIbRwWR6TBvwiWdQXjcpR7Ouaz37wq3OOn2MghNHI75sE/GAYuWrRjGngwAIlhuCRHMDR0ibOKq1zJiYV3OsdhbREyzVYEzWK83Fv/FaBHHAWOPF9Galwja4a3qHtSgor2iyV43pDyzXSkl9dtQI4JMeDNryQPFqcIA7oOLRi+UDVWl4ljK1Hvdu9JoqaGpIfjjCCwKjWtgk+HcHFIdsnGg5y7y44iffyufY+f29vj76+cq26sXdjHj7M7YgTei4fr5LnQOJIGbUgpxUuq8kfqO7aeOqL9/TJH7/U7/7+Be5sL3HNKxunskGmJCCSe+HRKGDFagyMn7PviFKbG9vf4+bjXS5ng4qMzhELdaBW/PL/RWcvcWGw9iNQ6pAeXXqf3brSi8RFApLSQPp/h/RfmtTEidgIqga+m8JvXgVPpxke9+qW8pkeGbZdbK+7aFNAZXDoz2cvwHaDg7CHiX5XUKKxvG5ZBCm9M/TNh3xPOomZEqHaQFnZlVy++hsAJA6EZaWhLGsCkIlQlq7qAxZEghWKCO7vl5IFhzeylkTRvr4vt3+3dX05d222DhUs+rIorz7UXZjurnmm9NXRLWJTT+q6LotDWIQTcXjK1TE5gmfJ1Ar4pRw4AWzU7rHbmds9bnw4cYozo9w3xdoVKZBCUTqLhSULKDq1KCDE6WjFzRsLlGUA9HpvfsIEP8IP10f5Hn0Kv/turtUijYa1zzZjHOEBDI5kt1A6RERTr6VdXjy3ePyevR5HHMo0TpclVnKr55yB/UmUjnE914HVtwQKKpuONVTKvKaxYG1uvnjFf/53XvJ3/uglPqoXueBz5TSphqwMPHHcjSP5w+SSG+SUmBLHkpKIEK+hBC0y6k+58mv7sCfuzj017dxUfcwAQlGVAEOL96zGKiGqKHVxx2kUnPjInLrOxF1n682ASBqtT7EgwjcNtFNDt6ot8KLRKocTXIc7so6X6bNN1S1wJYJzxo5sg/Iq9xkeZVkKGQ+MaI0cEfJHS2uoBG2uxcXlLV/GzuD1m4sIG+hctVZDyxr2tRTyJHIGK+BZvryGowZQigckN2a+3jvn2Pae/zZe7vdeRade1BQmXIMDZUcErTExcQeNLB6JwFgAg6IssXJnRQkW+KKKmsJXP8LIeNqGrc9f+vd/+OH+2z97uWc+vcjVd0oX47DOkCo5Lm/JuLgVIOyic87aG0Z3qn14iQ/N22j7YpzO1M3YeSQe/m1sW6++I68Vhh1c+8dNoGBLSJOd+JrEr1k8OWfEHGggetGVZ38OPHwSpEHdAsMIXFyxcfUicryOARRiwVlpSnUbAukGsJqxCZyl+WKvSHZQAYJZbyGf7m41CwihoOdaA13YCbZF7cuN5ThmapkGpkozd6IIAlgAYtyYa7cp2hojmFCfAjqIKMdrYXGmZVeqRrkyNJeL1n3hsh95AhctS3nc5LNsUYjABuHeMd2lup5taCBF9SSbqEqoEOcczmJAoU6ahDjWSYGcJT2JSSRpUvhdUISj4HbX08Qvoj4yTj5v3bx7iapsT6GAJMRACyqWlvgGbgMCNviYXC7tb2+yAKF3zfNf0T+8D14+DT+wfwcX7dYbqg8cAUtGshYHQ0CeovGTRBSSy7WkxIbrcYOpMmhVSlDJSqfaoUjzIip6Do9Der1V95a3kVhoaevOu1ycdG9yEBUwYIBWoFUzqgVj8/DmFf7p33gn/+qPXuTu/tznvl43piqOoMadoKRVRaa7H0ewggGmoUts4PC1JYyfvObTG/yTj1/SEXrGl4sO7C98+WbbmTphLykpprd2bgsxxIcPQ6pRaZqKSjONS6a9NZ+XnY5STa2rN2rU2QjsuTXujPG6QcvUOSq0pIOEwyMrXpVbgbWjOq2IjgWu59oRMiWdQJEPImce1ZuiHCQhcLXr4Y8pW46P4AqhubUrGFI1q0RZFcO8B/u1HbnesrdfG33iYpBOd3tWchXqdtYOB4CxTbegO159Uis30Pv0/FPre/vzfPl/+WO19OKp9ZAxgivCbavL3TRoZMHUUhpZkFGxpFVB6svkKMSEysjMmhvWP3uPv/43P5z//vMz3zzddQdNsLK49fTniBa6vsmwalbRvMqPLIpXY0Yq2qbReIF3Heem2WVvLuOZmO/7eV64gsZQRwrqam/poT9i0cugNk6u75CV33WqJ2fDqShUkWB6Etp9BTy5Ae6G9eol4C8F2A3Ak8dU6z+j4a8gGGiSUtNbyDq98Yy8LI7L+J5gBEyysGeF1GSm1RkG2S51GmIWkGAdVlmIayF1OKmVgqIM1AkwfAwjM+jBWWwZzA8eLH0pWdyP0nRSVpMQkijsrsrLv37PiDqobfeMiza3c5anR52Yt23itW4oytIBrbp9mnk6+421rDw18JO7cX18JMT9m/rrVV+QPDi3P35853CIQxzY1TghSUkJS/TECXRX3VGbXAhuOudw8s5107b51u7IKGkFiSmcxZgQw2G1FElKFIhhMNAWTjRb3GggiLz5CfP9w7o7P/qP66O74+bkXnS/ExF2g6EvqKC4Io4UvieEO3C5hvQAbMY1HzhK6FhnWlrop3ZHHgdJX0K6LDojiV3+oWjuYiVBYZqAtzRF1n5/Oa/7hl/QmY279/Vbf/1d/refvZN3fbF5bNw2SH1gOihtYrgspCwbiWFcdNM+650uJoOuM+kkf4YUtr9s3b+cubg97zXLl0TKmlUcsVI3SATEZi4PJp5lFewaqIpavhzatDhuzC1OUImxNZSa9YhwnMk1kevIMY00LAH2kRF8rJMweLZEBS2ukb02OXAwGPSuiqAhjhOvKsKCww7vSoV6ZFdACeBhWA2HVUWU1UwqDoOw32MZETQu6yyLUDhL7XYavZkBXxIl5jcluSLc7S0tRemGsx9RNl1poO3+44di4NCg1nzf7/Oz4+X+zU8bJ66SGjAB9q5qw4LIiOTjynwKEy1qZIHFvqwOU0EFaMv1rDAlfZzTRf5O3TCrOZLH1gRz6s17/fUfvdS/+MU7vvuHG3u+cUBxZM1nwpAhJkTT4WEqwBr9KPlW1SIivC+S6Mx0l9mFvPfNu//id6KnrNt1qPXQb/PsA9g5gE1LX5cWVNG1bK78efJe7ypPau27onQxbnJqN6dqwXZXwusNsB3Wq+eIHxTgcsOWZ9dctMugDUiipLCTyxik0qDn8sQxH/I7hxMdQ1C7/LTeavqbzjXHBssrQAgfPsrFR/JNJgJCVlBimCCUCQg2RQswSIs0gSafOV9Mg68IXRZ7HwVHUaoMa3F/bGB+5oofvoTzzobP3gih6eCUiNPgnMOgai1qPBUtKcF3q0n1Jta0jt4BTVksQ4lbvrO87OhMZJeskKbJDYCH4SKcAGuD9cJG29Hg7jc8nrgX9V6Soa0b88guvDYZe4bs8nAMcSjIXUE81Yw/9s4+eyJa8YKXzx/Z950+pR+5eocX7wdWjAylyorsNa9ZA8isdUes7BLXouyqZMs5kM4nqxQRvuetu3vduanOduFr+fJ/c6mdnTXsxsRF4sf5FIFDCAIIE4dD6DCsCJhEUlO9Ve30i/f1Bz95V//rt+/0+q+/aMHTVCcOaZdcrlEMg+QwvitkhwDJjnDE93B16uxHvz7/9HjOPuKyikA3kIn4q7jUSb5KnFlQrmQVQ2QYfDGWJ7UjFbmsSDhw3FYGEJPqEIAAVCijheRauPzyTGKC3EwGjIkfBzguDyJx4klJSVwBDFlcLXIOmQgIjmnn1oNHicEhIMbIiyQtVji8RsjlhlEnVCuhjFcNQnu84qPHl/mXP144dlUjteKxTzFAlDB+k4nL1tzEGlEWFf1WVQFhEFeE4+5SJBQpwxDGg9UnGbGGt7/6k1f+wy/e9W/dv+A1b66NcC9DQ5pWQ4ZNKppqKQkTmgop1NrT3Njhhe+J7aBhNEwrWsXuWg691h/+oLdtrHsdBDWJlqNrPkvMQs2lDid9Z6pPEGf4IXeDETRUtm520nozzXBR1KdXmn8eYNZ3fOuJNOqnNMYNUP1ELFLKJNMUmroOVretJn1wkMxyKQGJbWYdSn6eHm/EmFAV88CVsSyBy2MBsiIGYBqYSCNjUi4uI6a5U4Kv+sBqB4rV2+n4IpLHvoyMC9fHuettftg+mUi4w7lFcsdG6jRPJyXb3oNNMM1H7TI+IkeOvMnfa25s3bLjsm1tXXhzr0VnhSAuTlaY9Kl2ZZcrGCI0zyKikZivtntf9bRxajLtUqLLcu8ORMD74By+gOFSVUHCkeApQhJRBirGf1qpa+KSDSP9nb5l+RT97Pho7+h3nZyLUWSOh+M1ZyEFUHRcOSrBuY4GEluad060o2iobdjmF37bdMKFjzvg1uWn+c7xHt/jh/2vfS2Rg1u/mUe3OJA4WAxMauGn7Nz/g/v+5c2H84vbXXfsaiHELUrHQ/AE8Ekap/toLoEw7iSZjnHh0ddbF6+3r2rTHDvtbry6GiPFFNx0fwn70k6CkyHV0AeEvOhPraJTuG6bO646NPVAUXCxryqSEis7IB9OHRDTNJCRpIHFbsySQy62gM+ecNSHsCwiLgMCBECIqWylS7ogknfEu7OW8r3/t5ttB68MvkQLftWnKtCVAtpCHgZUAIWXDhMQQCAjxrtBTMfAK2e8PuKbf+mBj9V5i4eTdu4sRTdYnDcZQsUQGDbrt2IH3rkQAKfV5nrT3a/6eOI5tmqM8FlN8aCvcetyLQxhTXxoFRa2+uVOzxVosHv1vxfFt6p6Jg4yu6yKMbj9mLTvfR7UccR5UZccswC3I9XTj9O7v0vb3jzS/IwznHrWwaFwAs9gtMpRSGkhEAzTG92ZizDW7nSWZYQkAGnA0Awr6ZqsySWNJJDmMJvA+vqOPAdYJRfxEaHQgEXxakIASTpaGlugLY3GZRY5tm9g+3pt73MYXwVuUk2e9BYngJM1zWpXg5cfsYZWWcARlwkCN18d0V7jHm85fRT/8rBx7/N9D+Tn7p1vNmgmNUkZxFbo0TchiAtIw6I0uSE1CRICDBlS0dwffJZSO+nc+5O254ZJ6WJN3NpmFWoiMUAkDSd3suRwWMW3DZRUZA4GkfyhLVwYjU07lue7HPc8N170ZnzM7/eHc83VB7OaItdxX1hxcHkrUiRArA26q10P4Mke82YyisTIzdDMBJ/3Tt/7+nnb2qPaivu+9vgqy39+rwWcuO2LLZeObc+3yAY0moDrLertioL0cLKsU6CDORA5RzfW3B/2N3/5oS88vvjbfzDTgQyWF6nGMlJyTwiRYNIjLICU0MTFxHFYUdJzdi7HhS++Pv8U7nERfoS33FgGLXrw/XEkq5DkuQqOYoeLR5M7h0MWCyHKkh6uDGsGKiu2Se9BkrWLVVw/tpInxrlpULbPyzRNE0DogU4QBTwJN+CjrEVaZHiYaljBEJksAUT4SNwqQjF0N1kMJKRxiMfxvtCGYOuaTDoYK2FNEf0v3Mt+qc7+/A9rQxnwI/QquZLyyZRrnf5hfHw0QacPAyE9mqATMRVOesJUkmdLcic2zbO72W+4vnH9yK/++H4vPL3kO75UpVpH0+WBhlBhQkRZVABV1cQEb7xNq/VH7XbWvryfRMLqE+ZG5pnp0/PfMS0YEVCJvcGGlHTmU/PZr67z/WokVq1ECVNY5nZw5VtQGmRTuyR9b4ryoUnTwU5FVNhh7v4q29OvgO0WGMu6ZFgG2A8Q2zHYj8BUDhGN7ZDJQ0+bdAUsZsJSPhzUjnOiMEmCJgPq1i+d5x1KIEIniSlgNC5omGh2SjSTSIyQUBiAYbq3HGAklAuJQmSLBiZJURwhZujj4A4c0JQyz19r29c0v5HJ1AFH+vH1NWGLeLJjtsiVI0v04psqjhxpreXHRyNLqYnTGVd+985/6VSfKTuIaMmWfQSlGxUQxyrhWZzcBjfgWZymJAkeoGJJiUKXljs9n3HFw4aJMTOJNaNy5AAxgE+vo1sInmEFEIAMr0249Hczz+6M2eVFrq+NG+uLXnT5FH/k5cmT/ON8sg3KWacCzpId3vTYpDxCQpLSNLwpl5ZaKj9Rw1xr616X9xf+IOe9bV8+7TzLs05ePu5H3++44HTfctlWfzzxtvaw/1E6Qyig8H3B5SwZWOxEyANxWqTLq+FDlUe2HV8WDt2eefzxHnte2KgKYDxMgsbH1uSq26yihYc1oQ9UApSFLbo+MxkXvLi/4PhFDTyiEJwrgVQnUkVMBdOkFVRpj1tNPEOWzqs3UxrlZcesCe1eq9eD8DghMFzCA94GlPJSgJ6UGl2bj2RoYJKyeIi/gTTgWbKygHEaqGBoQhBlVUDR5IAKXl5rBinO2azIBnQiLQKQmEQC0y+cHtalmQGHcYnEb/+I1y+v/D+/3LmOtfWxMrWZSLCqvLxO2/tcYsNC6kNMSF+X2JNTeMCBxRKWaY0ZEhJXj3H2vZ+f9TzOP3o+YU/YInfAmMkgZ1etXQ0rcMWlmUNLXgQRBNo19blpPPfbsdCqCB8XOK42+kPvje1nzyoTvKyKYMkO+9ywJ+dbu/43C1+TG00aQWX+C3UdgYutpLuYguuiLpUDATYb9HpC9vEn0Qg7mrRJap1SmdxcNGhrMxVIUBuEoGQPVUNBG8qQy5tWO5AGVqHZXJQJphsyAqeZSIzABKiMMwkwrYVLFCRCzTrpqrENPqDR2BrVAGv2FWGp8zfzoq1pXv1mobkO3Lyx9K/SbE3NpInrtOxurPpIVUlfGVqhNDVKu+uFH5/nA9/Pbbuokd0HUyv1qOcXQ1vN+zFxTFMLUiukSUqIk5QUbkjTQHMHiMM93SYb4g6257nyfMr2ZtowjunUv01NgpgQh2HIfNEBAtVwUfMjIR5efetf/6O4GZ+hn9vfa1pz1RoZ34l/VzJYJg5HxqRj8a6fJ4RmaCvC5VvnNqJBO3HX+o4+cKXnjtubc3TU9394ftgrceFgfZk3eN70/RnXXj7cPXrBqZ+cdOPdBQ8/HYSAc9VUNGzIOQ7ExV6cgx4OgSTWCRsgqKQvtNvcMB769Rdn/MJv3unNPzVVxauAu/pGq7TIS7jKhlxBG3pYw4T6NM+4nsKY5zx3c+ESGnX07iwsxEsO8XKItQXynPiwK1qArxYFImxAlHV7TGRfOimu/5AmWuhZG2IWV1TDJhNr4A8rh7LKKYLL1pIim1QqEJJFwzuHPiXxNK2AAtLEQ5zAsAKIaapolxsxQlJoqJGBOtGSo+1wVNIAaRKD+y8aaSQQ0FZ6SSPzVb7Zzn7y7n9tJKXQpkokBDxu1QYDIbVier3kqADWyC0OSX5793FBnDikR88C1opwI0MDq5/3/Jl+7iOfP/T144vc+rJRVScokZymVZOKpkJJ8wj0ur0jYyXpMm0YW0658NPdr95FUuEZm2bU7Uc9smzb4PxgwFxE8qsdvh119+E0Jax5mJSeVKVVDorWAjQG2Izo8ykYi7p0yHUpwPkOuN1y4QVduTA2TAohndPrYjgYVsOVXJK2IomoMFZrNrkMU8ooakQnHu6VCzcP42nAoEV2iA1CmGWCaeAeC5ZLFvHNMkO1w/UhE28BV1l7zwGVOT/w9j4aAxkNmo656qkbctpAv05RYeyJoT85Mr1KoSilUvNuG8brud55Nju+/Q//ESL1IyrrIY/KsBUxg5vSxIVFkCbsYpImKc0dOOIiHYROgzht99PpV9SGXVeaphWKnHoTPbI9EJy1Bq4YDjwFF7fU8jQXedaW6uZeM2cT0YB7I7FQBkfaRRWcFT04QgIO8MC41Wto+WVuWuA7vWuanR/zHVjvHvbs8RW/uqttKV3geTvHi87Eq74wvfQqdvY/3v3GzRarppUA7hiHujZpXQ4Z4zKJ41ZXCuCYCKQpIRZ/rHfus19euMT5oTeMGI9JvLX4VDf0Rah88nQ/BWHXe8fI21sPvzj30PWFq5cT5mdVEh/HcYDcM9BKh3MhsDjgiQGCj7WzRwYuMNENLnXEKYVnsYcCAfiQK85ZmiGnwpTYI3nMkoGLGUMIaQKEo3GAApK1291y7+iR91+pEo6Ql8mQtCiCOICgAuBa4hyAjNyZb45X+F+v//HXrV+nzTQMK8RBTJqkHo+s20SI0gMHuSlyTMVNxblSAJ4eKOLcZO6vuW3b//VZxy6NraZ7l5jLIwHKTNh1BzAqHeDKkeAgIuZG9jO9pxe8ffvifEFvigzWtXTmc9z5RkWbWMjqN4kI+k7+nh16F5CTO9f2UP1eFJ08NhU0oQaxHf0HoBX1SHmrutrOpuBrV5KCLbjGcjudTCYdMimBg7aQRcpV8TKBid8uqdn1hQz0ExVZlAaQTqhC2/ABT8CDIwEVklgQ0gQ4CYIGkC4F8QdxSpBqlGXrK8uZrD5DDEjdArFj2HZsyta+wzVpsWdj+ISsOrNk4hyLrZkp6w5R6r+ITZOHF3jv70694c9O3t2XL62Rk0vPPlRnPRGRapZYRlpFClSLlBCHXYCUXXQ4x/Jat7/QxLv84fPm2cV0Ws+kVCQrLlLu9S5LbiZkDZeWIjukXEwBcAVaMGEd03pkNIS9HgoL3QBhIA6soE1QRmjJNKcjFl1zt0v4bn5rnjnetx/zzibPer696rdrYWX5kuiCWtY5Oj5C63bHWWf7A0/ERe3cHvcnjNcFZ6ecuLXiltOjEWUph0aOACy7VFgssDLm8NG4gt1PPefQvGXl1blHfcb5zcYQWCl3wwElBTicDvqTm6slHJAjqxaM3C/gnMdfn3dU1g4AAXLiOI0AuALQoACEXdTEOANE7pgCxCR7Yr9olShACiCHx3sA51CoLYwZ+HgJEYdzAk4G+YAkvZ3lGFhejm+Ph8EBJDGFJb1t9DY6LA7Zr9H1FsTQHyQDiiSBqTzdFGkMObnnqvs/XGc9eX1FTcpW0sBi8cjh5LaEYAvT8JS97Qhr6C5ZjbBN78G6NOyuiFMyTiBOQwKhu/a0ba9fzR+7vWgpT9zrtYhqt0eAszAbZ0C1yEGGsOR4DBSuVvUNE/NdLz2pMoS+Bnes7Viaz3whtq85ZooSn2RwbY56niCCBnMXUfo2qT6FZGqsQB1UES6sL3k+Ac/6IauoQ+BxD7xxKY3HnxP7R1/7odv1RNfHkkLSLnOjtfzsPJ8ggQjC2NFtcCg0d4CpwS7tZVCAEYZKcTmgO04GQxohoiBEgDEAgoApl2WRsF4anPc00TOGFRVeLvw+8ds3xqNOxtb11sj+SbK4Cr3wP9+sZaawmO5WoXEIwCSIsiJQHLvnlae7vv3nd7nhvHGiG/glMfJrXt5YXx/wnbzwxJS1YqdRYMk0ST3NkxRI0l3CrSXsrSzcOP1Q77RES15b8doz/ted4FxRTh0DC0wo8liLINLM2otwgaKYWgyI+AxnDW+FUBQgWZnhA9xaZlbRzmOG5eiUHT5p6t2F+2+2LvZXuG+/bbHrZqybwNurps6Ky9ZKO2vNb+HBR+MCc2frcOKOeOiLejuNkmWXrvYaWWEgRcMupkZ64zE2Cm0BCDKd7lWm0FmNSubWJW+/UF/pM1fbzg6bcjGDON1rgstIh5g0m9y8zpKCOJ83BGSq5H2PevL1+UurbcImJmKNJ/QrQFIUIUDeSi0AYpoOBUIj1C4dxCiFIlXRcS2hAlbwsUOcQEKapODziJKnuAxRSCTXwSK7Nk7Gh5tpEBI8i+M48VFgkI4LPEBeFAlLHghWeSi17geOZQW0n6QaL1PZdCs83omTtBje2VDoCJ5ZEKpef3nH5uUhX79TW/0SFcwnCfkiCD7EVSsq8DE3PyWK+cI82G7Mjd4rph1ra2PAzcwNueZwkqSJkOeAyLK2Dt/Qa0nr6M5l26N3jzjx/PzXXemqxMUOKLmYLrOEiOAWZZRFaQ10tE2T+7lz1nvd8PJ1I3xzZMdeEw9+SH+RqPG1HTO7TzJcucN+KMw1ae/uexDJexO34IBlEIVizzudfxlcXHV8s1+HwFQ5nu1Am6872cc1qK/BsavHSzpP6Cs1GB7dkIq7S1gJGMBSl0LS4c5IMoHkNWmqSLWoAmqCnLqchTw2NAmn0ipLACSEwIhFCCAItVwOXihDpPjA40NaTq7o4vNsYNEFW+MvEm1tuq5bWdyX8P5/hCcbMw0M7RavsqrF4mzytVRiGhlzvTr56m+3XDW2zOpJPPu6ml1TLcjbzl7u962m60UZ3yCDEKGAimGVpKkSICEhSWMIhCUEhRzJ4eSodqqMOqcF36re2Lm17dxsptIfLfLWCL9mpDp0baOpaJiR+ZxcBXXIFOoqZjtDycrEQlaUWIEJAQyrsp0VOTmDnHGsBYqsm6TpOHh3kMtDUaTZBzPU9VNlHe6NoDfTHvXiRxzF+/g8on6vo4lqNV1UC0X4AXnaWSNy7bvwDB+6qQuaMbsQf7SG2u0jbeyPaPOg5odGVVFEI9moGQz80syIDacRa8jaOsMGuingmNIbazgGsBjk9c9/5Xrr6YtpWs3NyknW6wdx/vKMo6G7PwyhD8gxB9JzoXXLlNiYFy3ttp6M+VXPTufbacFdOgKHSzrGANyeOImtTUUABKD0phn7pxmE9MPEpmF7ChwWV45GGcvaNIkbUhaHG5yUMJ3K41RK9l86ODxOm+H8tNQIEKta25cOk0hoWeDTGHhdrxIp4FzPRnUPXCcLCevLjrWySpKYqXM6eSBSfoj9gPjVJEygrwpVXVEQEOs6/vjzT+X9v7nfa0QD0yKssqTChRQfNG/dFMGG+w61u1x0fIc/8HjXq39Xm51tRtSPs08s7+XT2/0+PZ0ar2Zr9bKjgRTE5VOLtZXcvlcSSVajum0/uT/veJkagR6uA7SzMuNgJq6E8lIERoxwCLi2kgN06iPLprnL897J+SZuEaGqk2c/M1105hINrAwgtAgTyiyKzMvRoRu1vFC+qOSNiC/OzuFNUFmh0V4E+7/kYv+EsB7VITBU5G5TGStQC9oTUNp0g1z0tgOGY4fCaIaC3Gqe0zneQqOBkDMAbnq0PRZpq7kM2eJb+423DobCzIhEIgh2dsseDb0kyiy78koUKpRpzSfqFDccMealeouxrRVHGSyucGGDWq2KGeQ0GivpSIs4XhMZvbli+eB3v+m7E298t3nfcUOPqsgqgrMa2Qx+nbMPr2c9t6tTdVSAVR1OZWztKKuqAAtIuY3FAWuwi1MAb2XfajFHve8v6AU+dK+qUpVfJ+pvnx9b14/sKb3Ijpr8FUcNGlTDNd/PhjXTyg0zhw/7Jz/bOO3lFWUoEIU8jsJLwbigLClcRGEQMGCohDdFg4Q0FLTLfS2TTJa1qeXKBHuVDlVG6kT2Mb2Jhx9oL/2Xt9Gg1cXbbqyJjzdF59SX+/kQwf39nRt48OnLX1DNRk1oT7WLSH1++vIp+o372auOZmrRjoVa25bnC5d0wRE+ZL9f/tun6I15s6JhGHzocklEJxB6NM2XTYoDJvgUQ207+LKxgY4yHFjT2QgbZPHhNMFVUbqqKvoo5AAnLRPigE2UrcZKXPTy67OXzne/YLeiwlUkBE+vN859PBhYy9u0QYxNiF0vXuuAB1qFCujAGzylJDYGg305Zd/a42UxiRvSRZ2VtnPQ68HAXe2NOLayTjbrK2GlJ05oBbHJZ/YjV7LneoiB8TMJMQTlFFQwieSr5XjaWHfkdTrU4m4kjpLWw7oi/PhDnSgLgSNuXaOrrFLVMBUrBXFK0maj4Y6jcf6B2y1N01Abkait9DCVE5wgvV5EURVXR8xb2/HiP/jti3/P70687GnjFFV7stmjHJat0bRX/M7dx/bDdyeefTPTWMtP2qtBAoiToutNqjSCISLGlQcVbevhefsp2EbWqLpaakWCMiy40o1cSVZm5ZVAXrgsa48sMRqBL/pFfHWEB0W9M22a9BnX1k7WCBR9WiZ80bG44GDfsdmvH7qYoaIIBY0O/TSjnQtTHpr+HauN5jIYqeIkFhrec1F3MT0d1yFw06OvNrUMPVIDOBhhh6q3Kelm8jy43TRuNIbgxJSwgQm+uWu6IXV8RZUAgjLLIYKsXXOxkafgaqAghDHRZbiBgXH5HopBu9ibV6JVhTGCFToL9ERFvMkhmmbLNXvW+HYZmLl4Zc3COCCxuN6P7IQdj3e95uGkqz+eMB2q6kokcqXaUB7TOrCDfPgjffuxhUnApylJq2IIEIpQ0DQNYVeaOulRTrOzv7W8h0/eWsWzI/K4xSs8VuGYMonsadguvaMPrpuv+U20ZWt2XFgBByKQAYgjZ8AgH8A4WZHEx6HIRuSO5ZRD6YROhzT1P48o8xHP6N3/q8+i9bkGJk8ywaoWoTLfc/PduYzIAFvrgUdw4dZpYYSPXXNrcmTmgofT7/pux45j1O6q4Ddshxk1mxpKab7w7P49f0ov/Z+uTtz47Ad5Gf20AziQReQDIUxu3H523jnsTx4JAi1AgMIXDIE+VZ/F4iTp4HJnmnbWk5+ffXrSTbedNUabAXCEEMkMYuIChmhxl8hYLCSdPGtBQfDOZeNWSpzQNFQg4Fw4GgaaMcZ1aO5XupkXim5cHInSC8odOEKNqOtlmmUG4sVpKC5IDYjsPn5gmiwY89p2LB1mZtnQ0EXWlWOpSG4YlpHhYqdFYgrfoTxiqrxehfExcTG/tZ5zoOlm8kCLiuEEJ6XzuIm0bv56XFDNL/b9f/pO/t9fnH7ZjSkaa+Sn0/47fvfx03Tf+Mzc2O++/qJmmBAWADhx+AIXTyTxmrzo9V20HI2t0qko6mZNARTl1BdSZmSlAwQps8yxOB/HVawllGSkDeP7Tbs+nrrdj4fQll/kWY+2i86ujRqbVTASlCKzVIc/Jx/kopuhvOtV9yKdiSpi9knBbVdlfwd6+nI4fTrqjoIA24Fqs6WqVbPpBLHDGg+ZYiDEMxmtlGPxeEhaKIOSdHFnsHGanc7TclsnWmjr3dkWNDkHVbo7bmeX+FKCBVUdJT0ASskGK0pVdCoDH3tJ3itswfYhIw2rygkI1ugYc7DJqMNeONBtxSEuSdEOpTaqt/N7edL1329ZaBs781toqXRWGSlVQDcV19p928r5gY8s0UB+cuXNsU5gBQKL0yRNE98ssMs9mALS8+4KZtjBgQgn1naaKr3f1ztgnd3txkyZ59r7mQiN1i1YBigyXEkbkJLFhRQiLonHeBIySplqyGphDKXK4q7Xci4wfegTp4/rt//i/NL8FpNJFj6ISTyiPryX+u1/EeBBb+r8/rqjkg7hLtPWgdn2WpuYN44sqt114fErLI6oCNztoqeP/HeOZ71087F+7MYcuP7tGlOrgrYLQZzQXAPEeWs2BvULU4PqigOe/nSKUYkNJLelA4AKKmvgnDjoIIIY+iMff7FwKuc3RZBEYNopiiQhD0WSCHlg11c6AiIO4mkmIWHVBSEu0gFNCxylgDhA/LRdXpemTYq0SOMxwCjy9K+4y4WnEy95np0/zVSzya7qbNmsiArWLgYxOGwD2zQDDSh0QIdUKCrTvOMt5+bXTXt/v2XnthBrTd2gwRFLqhgmqjxeM1UiytJSHw2gUAJFx5SzaqX4VHANcn65Ljq6n4GKCJK2b2YSpCgRsVhRqyVxlNNWTc9z58/f4Sf+5LSLb0xRZRTG1FiEyHXq+YdPxR+ePhff+2pzTjeZEJ4+S1fkynJX7jw17zg1N/qIzDxSBSvEwZeZEwHnixFABn7UviLLwJWemylpubnR3cz4dp+77pSn3tX9sTYU7cz93nribN1aM4QZZWZFeu9G2WXYMlp8n1QewQ5kSYVQHGTbYPoLiN2L6N5b1B3wtQo83bBl2KN9uHVriqm0Sd/i1dOwwLdoJEx+MprSjKgK0qQtnMmSy8QMCWeKgAWcxsvC2R7ykVQIe2Er0w1BgRjY3BFgeQOkyxiLEicKjXrD7ihCIyKxUOqb2uvWTSxYVrRGr4OjGlMX5rTUNR2/WiNsiTwNjiRMlZuWNk5vJ156mNlzOGE2rFBpq7CGBZEroj6oVhp54/x07kmc+cSk0QeQMl9lWRuE3iJSdtWCXVrsRvlAgxtdiUoX9AyxbkDuCrwxugdqighaanZyPXEv56aw3JXVKKAMyjaQuYFGblTSxpV5RLE4VaIFGlBkJaMMWkZFmUnhUyPmvnLlOUcun9uf+mzbsdu51BsuV0phiBpaqPPjqv/8vKgAFBdu6Lytbadgi6rW5QcaeHaUNm1KM9GfNJ26goiKyLte/O5T9Cfffjbf+8Xms6/riQPTt1QOQEGWFIVlFPqNOu2wVAMlDmJrwv59AwLohEkkhBj6N4EcQ0tCmXdvc2UikT3dfvZqxxv7C5fHybttAjZgLCvEodcTLVT9PL+1bwiT7oIGF6MRcavsVUo3FdaOSk8IQOkgsKSno7K0nGW4nhCvSFX65OjhJj5JEWjRVaGdZfqwf/Kbe7znV3Z629bLvm2mqC6VsPb1qrESr76qPVq3JcXAbs29LunKJhgVhNFbLeRQo5gZd31KE+WySo0siPBsp820XSyIM6nRQJspkYvqT0nf/Ybr3ax1oQt8d7KKTew4PbYea4OxNpQk7jBo2CvIsqlIz6XXLCg2nPf0Uj/4m7tedlNrhVZUcSSvGqSREmpqs5XuedvjCdeO+ceXiIqyTGh87Z27cFgDHbG7PbF9bT9N68DivA9YcCU9B4zYVS8iAiMfOSK1wobife4S05rnenmPW7HTIyKOCy3l7az9bed6LgxwO1XYZZKFVeRXVfcLtX24+DQpH1h1rKzI5jZd0TcFuB388a8g/zXqzO3BVc/FW0+p6l9Vpqun+6ebnpr+9YGKwbl8MuOHs1wBNRBKqlQbq7oenzalndMk7cUHcyZQc9hqF8edsVAQFWisXko8xgw3SWpyuda+IhuVt2bJblIDjXllPp1p4/dZtyduCmANZ8FgDs6COtKExNcXEnILV62bIrQcle3kSz9tvvLbky481dupkwq0bzWhvIioBnmLddYd97ysPfQxbj26N2A1NYkkQcZYm8Uh3pUijQKkYQnHlP1SiOw9lsVTR58304BjHUKswkq1f96IwNzC410uaj+7TDt7zgeXiYOSS4uDPiuhpMibjPHuSDbiSEyhRSsevLJtrUyglcZxee6Z0+fh9+/OferHs/Q5ymCDakld2uCql6nfvYzuG8lSHBrNtDjbioUaxw5lX+Srjs210tYyqScZVeTqOm1YUKM9a2Nnd9drto/k908f+//z6oR6qiObGjt2eagEHGNrXh0ZvaGWcCjlIUEZYAOv+zhcARVwDDmmUE+cD12w1OOnaoCHPfDZma9fXuiW5Q2O+KsC0wMGkF4L+/vSTa3AxfS1ettvqQyCsh/XeVyvmF6lGyTpqMfFXOv2RqXIdBqHdGBpNRU6cThtQgxgcXf8GJ3z5r33p97+Z/bcpy07Ym5ip6tWAw2QtmQtxKm4G2Kd1XdGEtc5MKjWbFHYVxOSrgwtGVGmi+d592nbN5ZzzraL+jc/HSM27O2nz7OLVzMK6Idwe2t29rhhKkx7RKQmWhoUjf5YWBk7FydJIdZWi5FonCEK95w1vUQK1fB814vc8+cnn+fZsV4jjq8GkyCZaqRFI8wOP30EP777XP1CbmkmhncyyIdLIBZQHPh3bl+aVBNQpGmI/UG4Amhn4ACxsCxLmmblh+KgtqHHnRvHrzYvvFVREbIOd0QFr5hf6Rcd6421QjO+NRUFyyzD6vuJS+YI1cklj0ltYGk2bEGxgAfgOsDtEOzGLxtvRZ2ZBa0Phusu6qdo2oYj1cYB8Qi9R2ANzeuNlmmYlM10pNSh6nrms34bBjlpp5KASeO4FyfbBJ4GXQon2J6wS0Mi04goloVauFxhRDsdMUG7rrJG8iww1byhzQVT2zS3pkS2URgYT0UHQwjgjwRb1BA2tfMe1/78Lle9O2lut7+KI8Gae/e6qfI4IFY5eJEPXx7y1etoc5mBk1yZ105iFkvFrhdpkibsqogDWlxtI1ESzVVEDEwtKiy9PsYT9m0n7pp6B8QL4KANmSWyzNEmG9Eu/SIKKCJYUAJkzsmUEmNWBHfhxuXj/49+8B/+hQ20etBIOpSrYHXjRd4+rvxme4MSB1bxIvuwZaJtOIOoUWRds/uIJWeED/YcImzx7sLxZjXadK7avdQP1OaLn/XzrwfWrgDXRAA0HIBEQxnbOYWcgE12PB48uyog4mjuvAE14xGPfLl1PRvD0qPq9bQEPQqKAtB4aKANEMdghTQsUbzBUwQgJO72UlCBPTclgYvpY29d08w5kRBbOcJlxtGQNPMJgHPt37Ce2mx1fdrUq7l56o72PDWhRI71gCIjdoWGrIkwjXDJ8orFkcs5Tcy153fzs1tjdVjt/6m1aKa1NerLQ1++/ljf/voEdjc6NIyyCuvLSdtPW2YWVZVGngjk/86FdSykCGOCgAMBQSEH2nhMbfx0zxvenjB3pTrzjca81SlVb/fAgs7l/6a56Sc1Vt0PwcV0hLFWXL9jhVOvLDcuwMI2AmQygqkvEBGgXDxi1BqXVizLEbNdnzgztlwYP1T3FHhr3Z8e9VTt2BqOME4IJYwyU+DQ++IX/JStRfkgamM4zwnmQEVvIC6G4GZ8JRZRZ168v3IZIPrwMIAmW7wDkcwh3o3UKXnZ/JlHDjJqkE+JU0FRCeV668laQt8sOjU3BN8ylFhjyE+Ptq3gS7D3ZwsRBoiRRsOAG2PikgVKQqe0BrKS+xBRTtXYUDSfvCRbwhlYFwdOwfKZxGiQTZzNesoX9NSrDrPXHWs79h/AjW9IHa6MgBWPRdTqdZtH9U5/7ZuHPtsyIwF5wWLh1evlLKmBStiClCDI2yl2p150OnVHbRhLxeiPS3ZRwGWlOBYXTWAUBxZbmzimVKgrfpxy+Tf73f95vMy/+Nsz6IARJzLuGaSbeC+Dbx/CpQRQ9M29eOHz1tMGWT+wNiBABEwMa5UWMxwD5G9WVzSG7+96hR/5l28iajAwEGIlQH8CVADlaiRq2aYpAcetCtHU7cKuytSluN4Fr00XHrracQYbdvZ26TQ4QpGJxW3B4XA4xy7Hirg0W8RRkbaDgrQE53alQFgsgKA9SnYxCpCCkLijM1XoWvWYalXXLR1aaZC5gV0fORHBCWPnxggQvMFJ5tskfrisJ2pmdyjJuOXHtq/l/e7lBm7GQD9Gd3GXy44zMzSqGJxrDKox0HyfPs9FW0AWC0snV5r5+7kR1bpQobjtsNhSHS1RFLbD+erjpnEPrczQQBhWOCcIuKms+fnVdkdKKGk6ZXGZORm1S0qgZLFHPNaAIn6z2e6+1jve84Yoi96Ids35sEf7jv6aKjS93x30LLsd5DaJBtlbeZ+UR1KDXa5i+5i3AS5GYD85nquoM9f4u/8rwLMxPE4uVAFEsRkXVxmIbVDzStq2XWRRPEtLCAMgqzQD1g2sEtYNe2nKZNsap23D2Vjf5LFDOQqIjC9mWYzKWQXQSxHA4mw9FpV0WJUcNqhXr2JDL+fasV7Q/EhNUUsYRUH+djFuKk4J1nPkVm/lSdc8bjrncuK0anQjKTsVC105bUVw/3JEHTHhMy6Ld/H/+/XWI7sayAl3xBo0gerRkCZ+V6aK8ODdMREJqaPn8pvS4qjfF1trPtfnv+XtzExTrWJf6hdJE7LSMGSUUbqMpUXKCcSJZ+iJGeNzA8Y63TBf5tt62d/8S7P9XY2oC5kWJ1oyhDyC88fvP0TQijGIDr/UpdtdWts9ebn1zSmiRUYphURVRkPoFMOQuZFzxdoBpTxp2xZhDcmBAgfCknGIVIUS3aUAa9OyGRRLOATwAripY983qFbvLjrwevtqPRnvVz5wy8WsvQ4y7RDimIvbmQLEQOwcgBUCksWyVEEIIqUwdXHoZNOsONxdIg0BQGLlYZrSzfSEO5xyOVooZ3BKxZLFIZoW3uAG5dy0p4BP6xGxVtQzxh9y2/p0/89fRRrP1qEx8b9pZ8bGyfu7Xj7qEx7n5I5GXfP9WtiqPO4ouJzmTlhcWRtorVhRWbYqU5TdGtolmQd5O1supjlsGNkiPBiwpLWrHtD2mSuizWYbvZENtPCAOCkRyNqlMHIs2evhWFw+e01GN8yN6m4XRRQUh0OHzj/SLlh02pwDAIwzhOlZ/sp0r5WzQlHFS5a+a9KTcS0MaxBVo9oOwdW4kIg684zx7hJsJ8AnKi9mZ5dsc9VjcQCMnEhbNlCYBk4CAQhBiV26dalb0+4YSTeAIRDGBwNrKhdOLleEJ6IglLmdXQybNEREqI1w+QEWBQ2tfEefq615R5Gb4Elj2jRab6oIlkxrajOOatDTgg5padQ6NuocO7Bhbpvb9bBljjNda5VJJViF3PrsVjEYHLksUkXC2ovds774L/0iWlsMqiod3LucL3FxvRVSEpYWZL8TAEmTftJaVcgGnpmkCRpZ0L9qOF8Od7nsPDttXcU+pVpBQFjsASloauFoCbxDGcAgH/isYLqqRC3k8eiBz2zv41/8cOfiyzqsBY2c9bSiq6Itv9vBr88mIwiI3H1hvNB52z3bL2vP/qWda7r55iMoQW5rNDWMspTyxjbBiuHWW/ZFRbO9SwZPcqGP9KCCYRMORM0wqQgXSko07IgmrNt0CWu4olrkeo4lXe8Gb9OFdjPmmQ/tHnV6tY3paLQ/VWI5rapIHkTka40VPqobW0BkazGkiV8i2FKKWCQQVGAkXGUSAG7Uckt5OipLy1nm6PXGylByIcXk6NE0Bmub0LBisZvGA4OfbBvctnqpIavhoL9mIUZJ4QFxghPgNSXCGoaxUhCzYoB1GMcNK7qqhz7Bsx7ZX24jqrA7Pr5D7bnu/HjqeZPqoosxCoaHVYMjBJ3oZE+eaAVR1pCmPrGZmojYoqNtx+bcqIGAo7CQpBStqVblzGg2qEIBYHgnQ+n1Jn0WS2yTmhBYL+KQWUh7lFG2M4QSyEa3LC6cAEpMX2tYOku1tTkz4o3zT7OtrdcD2HE2zj/BZAY1m2iJWVhIcGV6ts0dtJHa4Kr7TnwhaZDlJohQ+QCMgyhcfVFQgJs+ON91wg6zxbQWspg0ku4mMzqXHGnkpnE4ean4AUJStTu9cX39oNXFVKjNJsaazIUHymKCQoZm02jUG41GKxorEGCXNOJ34wh+uqdwpIMDSn2ujdmOdUUdOt7MgBmajljFikxtguyWiLi+w+ts2XF/wr77Tb3wHXct2Xrnzq6VjvQtKcP+Sl1855/8dMYd3zxTS8l1OpF6ACcXD28FdnFIhRNwIvt0mtfVSW11V56OVwIw1fiZyn3DhQ+zs948RRsmThN2tczK7IoRGQcBMlkEJCTpahRw14JCGCI3UKPRI17f3tu/+/xR37mrO2uKxw6OKFEOvMX96sf3wcc3varjYLYTL3l5u/dEPNepn5z/zH4+ISIBCzSjkZzcrsKKjOxsfMRmacVuk1RFprMqpcVhKibV4WKu795rxQTSlX3uujUWF0goKhYfwbGO4ATQZtLLr1MaZz39+rzFsoOqj8qPSDimjP2WLRHBgQ1cRUUcPEvGuuF1DuS4yjocH2632XP0pjhGXCZLwVok9kYlTKEb5z1ZJk0OA1Q0lY5ELl1K1akbXW6o0H2dSLDJQ2u9y6VslyPvjqVirO5lq9qwFIzHxIRQJHFbUU+cZu/7D6c7M9qhFy8k1cTped726cSd3XR9fXui0SiCamDrWqjh4qN7kj0MKyoYDuHoUa57o9lBPOCJN+/kp/+83rgGLTkQ3BVKEU/29lT7WO9UiGNIxQJlMwRrADiedlmU0NJoZeo8lLSdxtMcOUiGB8Q3zWk6TgUolTTX223Ydtqwc4qoyNWPx2MzbPNHVZvASmiw1uj7Gq5dz0fZFzyeXEz81MQX4xo4YLeGBzyW4LL37PHDor6Arwe42UQ++UsI/tvABir3Ke9OGxR3o2tXR1MaOjRupIOJzoSCzNSd3ZTU4lBZjGKEUDgsiwtqk/U7mA0nEJSYIJAGG0WJy6+B4IQjEhnBrVswjesldcBG61jDjZsUhyyqItMYmpTxQPBSBdPClu2Pm+YuPyft6EZiSWTvv6Q3XvHdMiLlkJJ18MRe+wj+3W/m5o/K8nEcp31A4fLRUaRW2IWKYQUOpgjdmwTHkmLNMhKe+8bz3Gir9xoy3ueKJYqMDApxMiKTKVJ6houKNEmXtblCMfJplXuKC0+v7+WP5vt++kf17AbUxEo0Ukg62+1PoP7tVhgD9O65LZ5vYXvu7uc7Hr7btrF1j6ClVoQtsA0j+2inrwxfRmmCc1bQxbq9qoIEx/JVTYZL3STLAedcsbu/t9fk8BtNqVjcr3AONxXBAX5adjTcuXZ9wev77Wtj88KE88aUCDgtta6VPEz6RczFDVa4XMBNxyEkMoICD4i4XYk1OuIAAR8GziUpzfuexONw1hXh1w3/RRWSwbK1bXoKLhlYqjeYlm0LNCIZpBYkYyiGJKRUSQyR8nUuOn79ql+6GdYj1osjNGAD3e2CTyfs2+YWaD20Ii3yAy3dQAUHBoYkVoBA02pYEaeIn1Pc97P7s5fXhX7Ve9JIm6WT4xYfGA5rJWy7TBU5ISRH5fC4VQEEwIKyfEIYjxQjDkG7AuB8ARnC0q50ZTPGlGXBE+rdVu8dT7+kXaMhg2GsmrbtzbZ2ZtrCnYcWWVRYq9wzcB3b/VaXDlk8sJQwoZjdrqDvuBivZqrqCxgK4ANbhqdd2A3aCuChIq6ZdILKA8HiOMw2wcjodCnspSEU0lPO7pMF2ruSkQBYkFLQySWDcSypaQFWEIISgKBAlqVqVCQFpMuBpC7VYAKDiVU7aIpOGOFsVS0VtbdDUwPn6mhE80WujGqvNZUwsuJe5Zjp4YRzz7XxqhcrIi+LcrK7gLFLKa2yE4IJnnaJPvz/9qe/V0MkEyRYu4IyRy6etwKkoRkV4ACcA0FkCYckCxXuedlxy/ysOtZYisIK8RJZgdDGlwBFVjoWDyufJiAWZ6MMJVarOZaY71/ex5f4Cv/xR2Z9rqsMEEQrqnrEW700715BjwsgxsHmUb3zK9bTx6ZTjn15/vHe8Lbsi5w0LVRWKYShLLNsqSqSaxVUVapYAKcC+aKlVzna7pHGTG5CSSs6UwDxSYiboEVrgIADcMRke9IacdGLn19wkjZlIvNCVt9UkeGAJrJMy0fwKcXFIENiiKcJoQBIUnAUsiusXL4I5xwgq24JT/N+Ibe6ZSsly0Vk5yFY6GUADKaOXY6TOClaxIUMMqt84Ld6tLlU9Nc0Gjas+Va80J1/OOmCnWm1yLjzNgvC9NDa7/XrLME7XNwMLQ4rUpwOf6DtB65e5otv3sUn7u+z59V+bUYCrhy4YrlWLarAVHRFUVAktEIMhAD9q0qJMnSVU5cH0oTFJRnCro5w2RJxISNHrzay39DzXS5uSSQRF+6Nzn2VpWbszLz3BvZHZReNRJhiqvQJ0r2zM5w/p4pSwctJufmsC94MOa/qSoVSgLEP7UMZbdbC6arSySSjK5/YSS6wucJYTV/iH6DRQJg0m3svi9sNXlsWD976TVYzbGsutk0bdxqwmgQljdUoMlG0bLg6NoLpRZw5MEKEYyzMrWEj/oCnzPiUsTIhbe1RmMUGKGTwG5XXtcsoOdayizW05NvZKjfuOf786y2gTCNJyPdoXMLYimvuiHWxestMxL3veHqnv/wnl1yH4ABcXjp3seKEJBxmccUQhsitTnrTrNuD4MfNiqrR+Ls413vasn3bMAtbhopwq2toQeImxZWMELkGPCBZ2YRCkoSM9ZUsjdPDkxxV+5UejPf1m39Bnb791x6oDpgGSqEjjG2SZ8X54x3+dqdZAj0jvoOLfK953Gvr9YUP7BfYGsJjLg1r3bFT7VJ1pe21wbQYM7TycFje8dgJmacYUFE1qWBQrGkNnYFOvp4oDMXuGuWAozxOimbAEQBrUF1OOe7d7qgVPOrRzx51fER91UayT6soaF/bA8auoOBixsrqOqUCB/HhbArBA9KOk6UKxpfvFsABnVzQaZJmiUkUKQHkFos+1IpKtZB0fLR1bRFAGF0xEMYwGU8YD6thFIgnNBdq8OXu4wZPfmCgvzaiNzw9zx3vT3/7hy17uqpYtagAFdYd6vaIcCpl+mSqZlQI3B6vzwoP+I9fPPzV9aK1y5aJuQhKtlg0EUBrvrV9bC1QHHDOpyDu9iOufzTBUl9yXfn2dlCJtSQNOMgsRNjlLMvaS4zH4xXBzbZ3GyZ50j7btiO7HI91VHXmCxEPVTqQIe+3PLqoH0W9eAIuXXwJX14ywL20CChKun6M7L4ObBuMVV2xMFArW2r5lMYA4nw3Qzq6+AJekzyVi6dufAbXgT1JRwUNzM19k3v8YgdBCPNwa4TNcTbKgzcAqqvGFCVsGxRdySYNHSu41AyIpnOYt6W2hDh1R1vWLKRwivGEk8frhDGZVmVPVwEWN0CDPFhzm/as9DYm4ItR6EZweWb8qOO0oS1TgJLiCPca+DUOYiFkcMtreYxYQydNzi/ysbd3v/v3PQ01GmpJJxyg4CBTiMWxFeKlkjRJSfwiqIYmxND1wPWmhQPBSRN/RCts8uRr/jA7g40TVCErp2tHjilbtNDEHwSyUQYI2TWQyaI0CqTeWXAFj6lZGDG9cZUo80Ev9ffwK19vP/L6C1AL7klFKTRxuUFRJz6O5peP4NKAQK93921+qUvPdw+d9uoPLjjGIy3bWDwqbA10yEBbpYvMp+0vIiqNZGNaPHDk66o4EhImd1p7qEWcwDByFTznSGSrwlptG7DytbeKiXb9nsoGlVHAYW0kEi9R0dxFWWPSNNaNLHyD4uFP7y86uf8zGkKDRAkYUxP7+tdOxb2Osh6XxBcn2KgVGV0KsHbDqMdVj4uTML1CLGRpTysSVbQsg54QHxo4p0SXJovi2wgJqfA2jWyD3dZZhbwdeVwSHxVfeBxXlBo5YcnqcND22IJm2RVWVL5+0KPTTPhOFXTWOYqY3u557/mje1x9o1pYfsx1qxPiQhWaTs10xfFrjeiUqa3DVE3AK8MUxoPWF04vX73nf/HZh/Wffv+OLvypUbMMV0agZe0wrQXXtPooSY7mKVGAxZbs5Lb4RhU4ZJW29o/WNljrKcHKy3EofCmlpri4o9Etb74ExPu6EdXVMc1NRn1yVSVysYqWTU0vPNbtfpK0MDHrLzdFhZ3rCuIq0WDJFNIL00auuMdtvw96HNLjJuCqrqzb7Qu0uz69LeiBuiHg5pE9B/t+Lj4KayjahinPTQ/TtoCWoi1feGiaHzBO6a915qaOJ2yLmfHQ2sYxI/GisS8BNAIZQZktEqQZFpSZL7rFbp3o7lUZJ020zWOoR4rcVC16UkQttMoKBmoUs9u6MlINFhpGirtcdX6hf/Q/nu/dbcvCTlft0rZri8XQcUMYS4jdGP4LZ72Mhz+rY795niXbMQGckJYAM7fS0gweIE5S8jgggCAIgEwRoNBy5GxUuPeN46S5MlMosmlxxUAphgyhQjwgXkRAvPcCFdXgtiQWf9Ba6bUhciVxEqlq0ubxw8Neiu3Hb5TUJY+14XarkHHsGK5n5XMPcIq8cB1bxpaZzrZ57EXj9BIJWnpjt+6Ua+pG4m+2gvcHsscAhZU/lDGMaZI36QCHtWntqZs6hQAk98Fpe4+2xmPpAZ94qjO0AISjacou+sXA7+wPqrXaQpIkEtzqlYuR96sR2zR3S1kAHPR6d9iKKRc31o1syK2gdF9b/+l3V3xjPrDtdM6sS0D5TpVzyMr53JVdUu37nmbp+35LDxt3zBWiEpBKWE3wIOARdlXAF00orjrn+NPWF7QyqaUj8bDKebv1Ah/7k3vd5I1zs3KES/OwKr67MFx3nM1zXvzBI59E3TDCZDWXccUu3g5h0N9pvMA//28v+QMfXnjnK8Whezwy/C1G0+5Gs77ivU/v9ff/7QO+/WIWfmgT1JKBHG7i3BOm9+Eqf+Q811/+n/z9//d0oBYXQFZcOC/wuxDiwmmXNWsjzcydo86ltNgacodqvLC+6IMpxKBRAgMwn7LdhczxBFGAh8JonK1zR2EFQIVMEq4F8TYGbL3LlbCbyq8DGssL/RAapJdQfVyonV0ZKTdNnWbHXQ/VFGhks+aHee6bVUMGKhELGm4N6uTd24YJzXThTCKIAuIKShB2URaBkyaOzBXiymAyly8/aTxOm9eP6RKLB0OA/l5dh2vgAcom3KxtBY/4+TLd47rvX/TX/uT53r6fnZluVDIDg4MDpgAlHV945xYGPPtw7Dx2PUurw7GazFvrCqI80JiLKTQXmu5V0Wqj66l7sGFiVm1Ly2VFWciQasijdwkyZNwax8stGvJMp5923uGi56bdlRGryZoStaRhujF2D/VDBDyAom/o6Ke6YUzq1H5+MCLKCjp441XlkbLoKm+1dsQKIXkvJYd++SYqEcedjrCGo7kG3mWUup3TPSE4Z52DI9dEUPYEQkLTILjU0l0oqtV2ypIYEQnkwC4VzZaPLsbuhSvsaBtlCa6uSMAlVRd/cby2MxQoPWWTaVWWdrqanURBtXR9wA8JKdsWerb9drtFEPJWKLSlQmkkF5kUKQQuphYLChxC8KI5/3He7f+YzPr+WmezlHTDTnYvfOene9/96S6X39mOrozjYoD3vYV63XF2vfDl2wc81GoKA/OJiPPIUncIrVA1HPOjT+/oz//dO7/p9tS5uiOxLnpa0bF5fpkHH973P///XvWLS81RVxjJ56STjt/tsVJYDbn/kWq3msyScOaXb73HyEVoqlyIXHBLEfKkVMTmiRe11v3saIsYkWuPUWgDaxRuTgr1AEVulKqlhWqHvqMhQTOFCs4gTilYiximALce4HUH8FJdrpgyBqh90Mp982fo7PTskjcGM7FireUtk2t9FCaKyaTRjIW19cLXkXtcIXLyHs+N40+oC8HhgCyziMW5QF6w2I08gCvJEFBUBB+jnTaiZmwZyZlStYRCNI0Xwg0uFvuiGIaWKwajx8T3efdv38Enf3/Pm3Yzk17OrovdwJoOnBMK1wnrd3boT3es+CFfuakx1+BvTlTpsDcY6riEm58uUEAaB9xwUTVkVwtwreGCfdrej5u3nzbttlJaobwiYQQQZZnQxRsuhmpg0lbuEBxFXEgwjhraUE0n7p3MyHaLwSqc+Rt6IWg05/4gv9+qjEAAOdhwnjbFmdBGXs6v8kAW52JCoq1ILuWyqLLvCAppYQjjHiO71aKhwNO8Z8Eixh63t9Zda5Ufnz12bexaj7EixDHNAzESiIgkUXgjkUwgUvH9chBLqh62fvvelv2VW0u1LDYocTx2OPArXOxgSypiXwZ4xSsUjL6ILWWgWQBVgHfZ0d5tt1taXTF2BZJrpIJatIYFBUDcJElDM8AXIlJIN3nI4eXl/2q8n3/7eY1xo3IVijZPv9tlf3i+n/o/97lhp0a5Zz1yZVNBIy9rO1aPF564ftWvzXX68mWFBR60EWSJo+J8Or6lkdg6+fFd/fV//vDeelcbbV+4A26fdH6UL/3Mw5l/+c/f2//9aqFWVG9PV4l0nPojNdNY7X75AQyqr6c6Xt445jOXz5+7//m5Z/7+s/f872puiwI4qpqpcYFdj2Moinprt7HHucnnwTgnNYoZY+v7E3eedAFt5TYhN3+d/sUEmKqeqLAjryYOmAPSMmAG4LUGvJXLFQrxzbwr504h4bx3qfyG2MbKmcobdmdtNNekEJu1Y1Pblvarl7SkE7/2Sbsu9QnYNsdKcAq0gXa7LL3kNPclkLnrIpSDAzKhxB3ad83MiGbb/qkmLFlLPKbhfJpWqYAKDqtK+s/U6NItI/3Ff/bnp976YmYkj6WHUq2RWOBZXKRuNBnA+GZXXnhse/jTy2O1VAnbqxzCFlLY/GiRFSuNblGapClJq2LxkF0UVp3YyL40Cu75todNC2utF6lJRgEEmPBorZrmFXcmR9yhy/3AOTkw0qOxeedmttXQQK3oxGVvVbmyD7KDPNfnPUGFQo/tff/mNpTLiR1EJ6SoPU8K3usgHoehvV7h6K9ZHFQiXd0X9u88I6sgJaTeQdlrA8PKK0XpIrhh3KZrzfb2rTTtydpKOoyhgARMEEjQESmaasZJLyZfqs39UQso7UQ6rz226yZu35moCaph0uIbmSwv6SLp3BTHrYvBa/XcCjq2zBY5881v4sh5JUs4x/uzZtXzuSvrmVZO3H4U0ha29ECPukzuqAw01nGfewNS4jxQQT/ohMVROCYAeQgDpBx1TLgV2eee9Mv80XjlP/nMrM0GaUme0LBPuWB7yV//4+e+VbOzcw17ZSrh1kFPo3zC+vzG6fyz86t+bl93ryZaUUxXcivmTnDihDvWpM+42zpy4fx3H/af/vGH9barmVYtH1oeuQW2h7z+dO6rL9WZO7WFWnpjiRmHP6oaKIYuUmrHJ1Vp02vhIJy+tdfff2m4+b6++0+fvS9v9kCJIxHyeWNcrh8BcQi4Q1ktdhtGa/MuWWFoAeFwjZa9O/mfaQVGkgAT/F97j8LvAGqAQoXbzjuQFzAZ3MBQAWw1YJTLFbUXUK1IFKfDxol9nk+9sptzhsKMemZhMx36FWXtjrLmz2LH2WZgDVT9LIr5DTbPn2bHbIIWW1VMRIwKf/DgyLN0UWa+HIlC13ihAO96ZQmRGeFittXn2j55CkdV8IZmGkaqt9YOZT89rogaX99Bm7qK2clt5wjucdXt7EgZhQ4RAUu6lW4hroB0+aB3eecG41hbbdiPegXbzuyMbXA9EcmG12nFKrmvD9vMnQJ0zmIrpClRoFUdpqLiYibujpHNioyZmdNdLzltWZgebxVWqcyRxmTIo6NiePjw4Sg9iIRIvCG7YqX3BPFFZO+On/2zrY+um2bXNTLRwsQFjXID55gewMcIxK0WsGk0tkxFTZxbeTE/yP3LmZZDGJuiYe+ZqFaoYP6kx1vnWgwDY2oT1WjbWWUQ69pOQCHfLsHaVWSvWo/dWjqwcSLrI+2Dc0MUvOG4Fdq7kwDoxOMScEEn6EhVJCkDzGCW9HLXXTpFFKRhl9tFmoxCkCbGYujNe1t1dYhAFKSlsRV1yhBtK3T7zha4I0eUaMGuldrtMo0OUIWukx8fNsdq+PVfPwVsbp4rYC3GVdjUmRhFNpvSVdk52H8YNLV9+9vMFnpEJHvtD/JYnTzklFrkoU2MFBOHEINPqYyJD50wiLCGgLPmY+nLwqDd91vn+WN7e2I/V6QdNZp1bwTudkU+36/+l3vc1jbu2GVZJE+9aCJeG1uYeVv7opPjfv/whVpvuTE6SlCSDS0b15pCIIAV7tQmqvBtlBE/wUrzVuOSn7/r//Trd/22V3/mZyhlPwIR244md9bctrlu28R8rUYTUcIItYQR5ZnD4VN1xAedvObsyH01hAt//z9VXUs9Pc6z9mz1nBXxuRh6MSkOAjlja2ukJUPstbKlzYzG5jlYV64tQBMTpfkba4JhglFsvi8fI2Y4AAHOTry94wAWMSD5R2qbNeAolytUK8DUI7V83702h8HZM6u8r5DE1UdybnT9X+hChxIbW7njtBprPT8CXKt755nZMTMWWuldFmvXpZ4sy2SRNRZJ5q0oHgt96fE4J45V0HY222r3WPBpkzAF11/P4vAaDW/GW8GBlk1jCgcHXLBsqqe5no6abjytY10uS+KxrMduOAbavuN9J4mt6s/4iEd2tbzyWqqDrWPmBJz4CfUEcIMBcPNFYAWaa3FINdwl5I0GVm4QJ+x92rxTs9un28vOra2yLD3Nh7swHA4rqmrinnjr5a1yHwcSfJ4ccErb53fDeK5a59AIk06cdkRJ9WgP98N2FYBzM5XuNu2atlPzzc4VFMoKXTni162tbbL2pK5GGhsjJOkRTSiFRrkaevuJHrvB1AbiVAALPcBgGlQomSe3zK+zvVIVJE3jlE7J4nA0BRETGBERs2B+WQMrgtlMCgOkFImYpaYolC2fy9ju4JZ0Q7IS6Bq0jEPAt7i4OlMhtwKqUPSjldzTfbPbynklYH2/pVm+I5pBhLJOP8x9obWw3faAQm9hWLXQRBXlBlKTrO2gCMSBxZE9oOgsdzpgMci6tQrcmUcu6o15dnm611W+4a1V9lpZNlxyOP19P7/nDWPLfB/HQbmq1hGXI5XBWrjxorOXR728v+jAXioDK5eNtTkWHI5eboUgQWKXvJZttCDYq//0I/pP37yjW18ZTmvOks+KZJu1QCVaMg5jiVbQG6ORE6Yay2GY6/X+f1rYlXiIqEAtXGruEADBArfW0Y65EWzZLVUqgmOgym/pE/VK0kiB3GZR7G5QffKZVJiMPjSfS7fZAqJovo6Zb/XlikYtwDiEvVTC4pCdIL2Y/1Ug7dooZ3rxJ9QRBUWjqR2r2eirBk0QJY47M+OqjfEP9AbERYGCICLsoqMUKHMWOw0szulAvlIvbfO2dpfdYdpNyTSNG6oFeZ5tmqMENxxqEReBDZ3U7WOt0/5+r6mREd0UR7DQg5uIQuNejpc8DFajrO2Lut83r2pKTbBOZTjRGrbwk+8CdIVmAO6LwDcZwpCL6RgdvctF66ZZznQsPqRZXzwXv4KhCQ2JCwvT4IPrSGtchHgcAVum72VtkgNFm1gX+WgM4+MXeTvLxz4gCkWJ0+Z14tR2cvVi+7EpskNPOpO8pwlfOecjqRbNa/NQ4oxJJTlux+n9BS/cXZZ4nCMFPIursQ2uPcXG2Dz78cSp1JUYWHl9MMDDnsCSpmqMiJQCnSh9nAaXk15ulkUkETHSLDIh3vbNyehbN44dR4pS7+PgQBAejd/rlqPZl175ZmdbQCLNbQ84vX7TaS9stPRdCx09INCW9z/T0q2tSTo2cGBhoO8DTpzbS0RBcWhYFKshBwgTa9689Uz+Xu5y+6NSUxXViFQFXXHzeed7XbDVevNkLbc2FKN2QR4MkFqlRv+w/c3dAx/aacugSa4ExmkQEAfkoEEeWsGGP2HlsSPmnRf/2Uf9vz+81M3UUUpDOZ9VWCOS6Wm0OvZW4eI8twCKkOX16ckb6SyhC1onaio8QKF5QeHck2e7fePsMK2ychJ6d6iwc2g+ES+gOTWlgjAblXb2QigIId5k3Ml4QSKACm26xRw/B/HykM1zXI6oI7q20gPboRrV7qF5l0onUn2AMWZGPNOT6cQE3M7htnON0WbLV0MgSm+cPM10qtbmnoEFuLJkF/uLEGciHBSF8670pSaAoJO1YC0wV+nk6THXKhVdQIAdxrZm2yFF2EKNlKFDVQUWyFw3Niyk0awbXm9Va0MXANzAhwnj44XHVVIZI3ELrkcczLNfXJRdA4PTd2kPW+C7AObmgDng+EU+0LQa0rRaKk6X94wK1T7d/cLD7IxMS3EGo7hVTGSpIVA1OQzJKl0KRsuiYeypxgeum21NcyPbJZZURG9yPBctSXVsh8eD8n2joFjUSG0e7Zu73DzWzOI+qp1qzD7ppqs9yUGj+Qa6xG0+P94WCzqUrZ/2K32lLjg+KRVHY53ABpz4AigqK9x4ox82HGaKM3vWmbnp9RrUQAGSliKnEMfEaQIYY5BCNLOzUyXtpfUPz7RN6uzNT4QFZnk5WLoNDUQCUHDKYujdg5E6lGZENCK+hH0CcvHCa7G4A0qGb72gPBZyhIAtTYO6sxYBVTpcTilJGxBCb4hQE2yDWgs32cZ7NbHW68ioJYbs4kVkTXpp4gy0iQi7QcgXgdPK576pa5pytJTyspahVceKEA+BIcK4qCYHtEI3280v+4VmhruaQsO06o1XxyCIiJD6NA1rN9/aeUrDWAhs3fHzj+5/v32pd0VNI7GuYSQnFnZ8nmMVqARrkbAK4Nf+o20PdcLDuRqIiZM7ZtptbuRc71TcEtGh/kfjjc1KNU6WLHPgu3QrZtoNcUppahRgxS6E9pjxIbY4AuzlcgSgysT5BpiuKDQm5C+hK5lCPCk9Fkowwt/8d/IdVhQMoj7m15rtTwYlNgD53MSx3qqZrig8Yqh2uQtoqWMFbZHgMkbOc9ArxpvlgBVr6Zr5mneZ3tc70wnjqbIeW/UcMNjO5WdxcDTqRjlYvFu3qz7yFLVWW5W/qmUpP2FxDg5w3jk31ciCxCQj+b/+iAeb2pRGKspIVRBtqwclbFloJRSAGQhwdt3aNB9qkTjBw/LacqrN0Zad60l7zhumcXumlJSDYlKxixVARVVVVZySsJKttONpGBR+kHbf8PdY2/3wY79GZaZ41t7YwMme3oPy44KhTYGeq8U4bTpnmu2E5c8vXM8IuyQ8dc11j1rVsobQ/vE8VaVsShdLKRqlT3hKo2kv88DhffzX65mtqBFv2xJg3BvGQy3GaRRYbk3FOhZKO+3Sd5tmsj5P5ct6QJwEkBSO3pCmLGaU2W638YI2e0ktQk9u1p+GTpUdFuu33lAUEdllz3LxNxfjhzd5n7QVSCL5TqVJmE6du3ixqcdYgNLNTroXtSPDq/kBL568SwQIaHG+Jr0qehZKN9PavfroRd8mlK0ByB9/fr20otEwaroZsdZwl1la4pR0+S2rVnRFvsIySm6X1tSiDg0sxS6ufgHiSAg1ZIxYBSQZsDisQkALfmTATNFFgw8XHPnqvJf72xokE8apEgAcCCGMZbzczo5UCyiyV8/b/fYj+5+/elfvanVt/csiKlJJzs0OqxYHuP7Iol+PT6+OL46F9vigAnGIw02Ha1XMdFfdsya0Q4Nj7Wuf4Q4LXQvU4kfA8FcggtUFNgge6o6G68SWbntKh7QnaK8Bf9C3eIrLD+AF2vkTLvyvQ/JCc++4lXMjiUd2p0P1DmdG4ks7hjwaeucmo5qWyvyTKGbG28xIM61hVYMCN+q5Jn36aCnuYoWEXEYWAnj3Zk7o7G1Xtz7kFBu+nDJfeWT0pwDJtpCxppcdcr33jw6akI7QUq035spaa8XVxZOUYFB8aNhftLiSdRzgvYHx8eKik37YfTeapQ6M+pR2ZWEH5oZh2ByYYYUUSDxUwzsZQgUQZY0T0sTHIP1GcgGfcc1hZoJzk1EsRygrBOFiDjl8+PBwaHGyLPG+7r6bxxrFYyXs7Tg3qI+EHmNE6pIqFCwYGGTUlHRVWn1pH+CP57P1FAaRmcp3n/XGUW3s3e14062DCnnp9m5CW0dSudYIfqHmJ2kzlHVVR6dGdz7F5nRBPV7lsQ8v/Vsvtz7zsobySNahIkEnoqTTYkWUldhAqs3xa0WOSJq3n+f6h5P3XM2Ob5Fw4AMOI1fmahFOS70SPEt3NZJm0l6Cac+DymS1su50Qf2GG9JWkMBGbAIUKuVSojQNv3uvcLhwAzgoknmGziguf4IS3kADHo2h0Wrt7ga68ur+uz/c/GfrBJHVzQ+fH1hs5E/+SzEiG6W7n8P32zE1phdToQDMy20qYudyvPZ8v77Z9THXqnp7k+p20enbjj7HdfdoI7UqhbTb7nY3WGHoLKNQBqHZnUeJDWKwnLqVCAyGoASW6YZJIdVTdUEtLnOT7eW/sK/VYRRPqpRIMxFhcZK66RusfJF33xE1fNb54+/e6b//k4/6Rxjrwsh5IC6SMgGIQ1ws6qzfzof5zGyRlsxzol7KkCFaoirxy9a1/IyjNqyjmVL/kGMRFdk1GKUVmnZr0hWg0lRMIR8lmUt34qXCGqCWD8v1sKM2fbf2CM3oA6z+Q11+gMcFSlxS0/MwTaeBRTOdG3sEOwfKqYRuZ32UP6oxEA23hZUp6jMM0qtws+PnmVHrKgFGpZMmQGINjQBtYQHWciCZBlhBI2sUTozDGPWYP9P/5VRv2pvWaCyWCOxk/Vl0tdkxZhqipmzi5hXlfsLE879tpleqZDdyYZ1ZcExkCVyZ4WBkAQrlyjr3JT/0ET1WkSsGVmW4SHsH4OYsHVfWroAhUEEACisEEpzq6K6XPG2YDTM6smVtKDsrudgVVFVVIdqWFq2QtoqVOLhCI0Xb0jlvGnesmtrtbjO2dbZ8mue1jPPydHacLECEaeS4+wJO7mwnV23hcG8oI2rPWNCgi0nHvcnYyRU7zrTItLXtULWWdallFpi3b+we+ML9tlfjvf4zbX36qwalpUoBHocSwmTIsAIIhIjamT3qbve47v3mc9O2hsURzBAk3Nxzl2bEGsgSIijanZRm2I3VQKoNm144TZib3ZEkLaxwqTfI33Tbvj0ZHw83eaRlm1KqY1N5AhQXy79RDwEIYV03tY3e1UvRLESWrtLHmjMIm8frtMnVpLC8yrtt5REt7i842bYNLhcur7VOmIAO3mo1VPHRcOBQD/cBXavROGqqMchoyKiuKOtppvT66HzCNtV0HtO8cvHuHKtkb1xwqA9B2gVjbeeEfPWqtVoHOwbP9/32fmFxZ0BlRO9Wmyzp0sS1vs78LJ8WHywje1scN/3A//50/V+apqmSyhkB6+oWAeKCql+GGI7Q180qpOuWCGS7SOFpqiXAZ6W2Up0Mramp5pmRdXasLIlTCIcQ3hWtBAFHxaDLX0J1BzDpMJIXwKVABU2a0l5Ad8CjBuw14L+Nyw+QS2ClyhKCc+chss0NIs0gkLf9f8y0/KUFwQ63netTNEwr+LhTHJgZudQ7eANERHDsopY60LcCuTUAps4COn0sJq+JhviM/bt/fL9nXpmSUdk0IYAL5+flourccOILVqq+u0XHpTb9rCdT1bhhOY9wd81QbXbdA7FCgIIR2DYYD3pSO5ZutWEEDVdPABKqcoLvLjBw2xjO8oGKJYcBSAC6qYVvfuK2w4l7x0m7qKsRBdF4IDy6U2RZoXTt8hBWAGGQ22gbZoeqtkmyJ+R+9/VQ1dB5Oj0oP+5HnOstNO3kqemkUW4gaidf/9aLGxO899UeLfheXgk1Mjo1NeK80I8/UL2lRrttH/if9sij9cjH86Ff0JnfudIbEzXFZDKMUSL0ASpPYFj+yHbCF3zvr864umamJkUESVgsWvFEClxHymazIn6RmTSCS0o18vtZdx7cnPY3AWUqkOXYF+lCuKFvXW7alKx0RCMjNpQTJHaxcLGtWHVdC3QEdOBhWljeeWXfRFVFADctpVvQdU4zrMwQ7/k/3z3PB543zubGuWbaftLOHNEAUR1RP9XAX5LLR0En9iSqUqEGiBiNDJtcyDXS+v+Ynbo8zxXjJ21lkEUQgpKBA6XDFQBJjPdCyANKekul+3r1+pX+YarTDJQVLgbBW7xii1zpsCYRWLAasZn3/ZdPy194c1uq8IB1dgugAMpQkroVr1u0srQqYDzQklxbEOR2U+WGMb6Z80XenvZq45W0CjRBRalgE76dGEbKV3OUPQA6HAAm0lEBbhXg0eUHuC1AK/fNwzBz2RcUD8TizrBkrVW1CjroFBD3J9660lSWxggKRYx6F6YVRgoxx52XXSHkBSQAg9y5fatAMKgGVj+Oh06v8NzNe/z6pLM9Q6NF8UXBC+u1oRoMkKS174MlUch0bEN1dd2UxxgowwIH0qxIlQCI65RGjFf3umLHmdMjH21X12BeeZo/OAF89ydtbgDGAyxCCDGJB2GvfKJ3vfr8P6hPq+uyYA0p/KMnpKy6sqPk3UUirE58OrCa6jQzmo0IH7M29qBDutCU2KF8qD/NhwvA9Wa6cc+FcUIbG1fvtp+tQlGpBxfHq+K1FY6PY412HL956HMv5wNbN+vsxdMFrx/OPzQuONwW3ugLZ270sGm3N9OqiaefIuAWESYTCyL4tdrpqw3nfnqpH/v95nNu/uwR2H9gXAxwDCayD+JOWGsmwgalerDwN7ay621M78nB6Q5FYSUWHJCkApBqLFbIJW/fGTsYJ5Ii9qYqsLMYEfoJUFS7hi2x+6nbxra82vDNsS8dB1nK0O1XEATOT4rIlFjs4IgO1eOPnfv0/N7/4M2bN9gi5dvHGsmgnfeiwB7d4Ojhw+N4QIStrOX5wtmLnj7ln/peNYhQhm/mLCjADcDFEEjKlJSeDxp2WpWYsbGx9/yAv3+zfbn7Jzox8GLgLF6NSmjnCB8JK4+5+uq/18a7/+PH8D+f775n0RrHigiU+IK+ErtACk7WfCotl+xAlho5xiA9LT32F1wCTAHOCfomLCdJMM+pZBp3slJxg7jQDBOiYBcAFSCKXH62lh/JXUf9Hr2YdMimCHN/iFo3TAjYvZDeeSYs0JnOtY+VM13+KvYva3IdEN9ES4tAW1bo97v9pK8dJMlqDIzTyx90bPrM/1e916+92L4WYkkRsEYjc1usCxoR2wG33Ck0djar1mZ9dK/ailrSEcYcrh5W8qXsDUCcpECgqRh8WAWE4u0vfJ2P2n+rwY06NLABm9CwIlfw3bD9LlDozMHA4FTAB8AvVaTAUdIEIAAHInGntrtd/7RhQfVeqSQrY9am3RTCxUtSut11L4grHAycbaiGnu0M5fF4kq6I9/2KWukP9v1WRuoFJn+s593mLV3MDl7uXOxKNSGN465Cq2PAWCFIpkN6MT6336eG0Y+wpLUUiJbeMBgxv6kThIrFzsv0QAReax7NT20f3q/8/IyruurFaHzp7kNBQ4VE2ooM2hBsIMTpEkvSma2RQvaQ7HToa8uaRYF8o72U4pAdwMgXEfEpyti7B7nNk5+czpDx4U/GEu0pIqGiYtdjU6eSrBQClO5F9+IsI7zYrpW8DMzO6geyEjbalXW60Scv+jaflW67BYqVk8GxmqvO+ALMJJ0cayNakp47tn86LfdDv+DftHC0281Z133VTUMOJaVhlIOcOIRxcUVmLYRV0jHr47iqrLB66LAau6jh/r739npuBuVGzHGMlxKRY31V2KGrjAhPSmzD0U7FzNX/9yP7r9+8wA13M1UpVms37D0aKqHf7Y89MSeMk4A19tOl+BFNh1pC8CXhaDzNnFbMTajHTWQe4ZxBXFDj+BGJMTd/3E9gQdugZ/lvMCEQCAAe2D0AMwA9Lj+AhOLx6HZv2urdHNIzG9l9oNaOWkfrHpFPdH5Tl7uU4pmDH9SPKgsZSw/po6VFVtDWDZhUktwA9MtGBBjq2ku3brTP2D//5y/70KuzTkKYOmBB2I7nqQhEOD+qwtXujEbxlt1bfVIzrZhY6egNR8UabjqNEhBWIUlI8VCUSZGKhuX0p37eq7zozf0V2f6aeNVpXzWzC1WUpR2jDGywwgX7HpKjkK4FjzKSwHBw2f79pnc4Zc9h82SZDo9r67LWPueSG1L8o4GUm29eo1V4hgSFbrf0CGg3hWzj668/0IiKcCS0rBlJr3u/fHueT0UBuB1D32OBp4VPGN42ju7nG1pXcjRNvcm6VEXZklYJYpowjZTydmPHb2fFw3KgwB9TEZMjcuQqt9YZEGVhQlB0XLzvOxElG7SLxvjh/drP7nPXcfPCzlRRM1yppMgYDiKnCmt77y1xAjpxOGUXTW26Ml42VhMyqQykCZsh9hy8XHQmUNFKmgkJSYiUZ+/Ij27L52cjGN6qc8v/5oOKA5lGqogqy4uBVUx7ClUpr+7vD5t6rGW2aA7BZ/reaqk81tPNAdDS3XsWFtfoS993XffHiKJupXfEgBrObMg5R89B66nT54BWTCmoUe8vIqy7QZaqOgfGbWDkwVkxjtJZ5vZFYUEbyYq7gn3ZOLaGV0I6Nu26y8V8pQdOF71xU0e5/5Lc3gv5Uo5puWqDT78jZkwE4vg5kT0vqPN+8S7/xTfv4O7dSWNDKa1Mr1Wwr9Xqdtl2oJoRYJr202WUV1JKVZoIFos2C50MQaHRcS39+I2QaMJgARgKIRzEoIUTQkbJ2xYmgIFWeoYmSIiEIrMCMKN6+QG2BdOKTZ2OR4JO6jHtu1P2///Z5oGp9VBN7FhFUQWUsTJ4y8dO2HUtAf0E0BZWoA+Q+A5iTG8bftb/zC/78GcPPAAci+PzWHWqKJZ3M8CSx6PMmfF148h444hU+EBr5Yil5cRvKRPihAS0gQensesEByjG1pXTw56+ml/rc4QBWSsObR0JCyqNetLocMONUwcFiAe7UAUrJMukUBQ2DUlIY6sarFkqAnPbzhvncnam22IGWGOto6QV4WLHACljhUhikrjQiCjSAh0tFxWiCPke5VRBalZU8JD49HCeI1AEYP+mcT3XzLIp5uj4y50DRCjxhHTclXSVtUAiiRTJWnaImNC9gSOi5fh2wVUAw+AvU2jtTaImdrKc3+sf4W//yQt/6O3J5+x1CVzWJmWQp8nTTeMAhCTZFZE6QsbGYHVgL1yq79YsSXuYRcl8pdtlQJMN9k8RSFV3wWeP8kN4jbF88A+iPMBNWV2/dd3tWniD3VOa/VpXcl9eUcyCZl2qmvYqgpIpXXxXHr/attGz3fZwndJpH7zV4ODyuL0njp1IcVXad4cuPU7bWgbe5lQC8esTfwTCSoEwHq2FbtFNnSSpUMrY+2w9rsZa0qjWO566V+/786EH04f2iUcktYJvAmLByh0dfJkQE3/QIz/QBVnt+fiCv/1/X+Ld63Mv7EwMG5q6CBCsYWGIu7siWXNEeYAjoMxirJQGhMXO57VAvV0hd6XnpFsWEHJruSwL78RGWUgiDPkisBSqEIClEIMBypDLT8ABtWj6Wa/N2VnZM5tuyldiXSHBWZetsbCl0uKAyJSKi9kHtNRPctCWFYAkJy/dM2+9dH6Iz8ln42P79N1LPznWOgiEhQoXMLZq0LaGi1wgbV1d/t2zI3i9S49pdGtYv7UcBR6LBdogIYU0AQrvstFYcEpx9on1oY9cGfNtUyeTmi9LPbw8sWQAYOanAT8BhGoXnJNQxBEIaatshXEUONxzkc1bFQv25tnnjfNbfWxzIuAGGnHxB6y4FSS2tsvCwCUMDDCJxsj2rV6zABWcxMQKWY9rB/W+HtbcPzDvI9ADULSZcd17b7vX7Mt6f9m6gfJ4CD6kAW2mzsu4kk5nLDiX0Z8kmZRMSloDLw7EVW7g2dvIZTtTNH/4aP7p/3yJ73t78rlXP24tTRDnrIAnPRyvkEKRkOxKpUigsSh2W+wl/V/POt996S0plXzfhHclJT8avpPxO2nUuMUqjPp36PWeIDiRsuTiuor20kEHdB1mLOk0IxChcL4KqrIAtgBrh4zoJCiEH635EiEEMcYglZIjohW6+HVWHKtFzKQQ7RpDQQlxkqQJpKRJyQR8LFXeN0K6+VzVxrZX/MY0m2FQ57FKyL0VPUsXK1FRethFIe/Kvo9EX75VQ7Ew8/ACv/azd/zhp3vvvjMaugxLRkIxapV0nQzqabumtwfQvCpcIuRAgnNOV+1P2I0DsASzIGRXVIlb1ymGYrnEFXQtrwO1+L484dO/HAG7gCgUxFRHgSGdg5tBcbOjehWq8iHYP/ILNQxaVQnpaWnkVOFglypMBBCl6YMylrXjBuhAhyMav4XK+hx8QR/X379+rw+6UaujhA7Eqvb5Pu6MjPBojayVW7j6xZhdqJlx16Q30zAeSTEqQy9KXE3WvYEUK5DecFtADHblPgN1wJjJmkqd86LPfXmaEWqgp1F4a+teh+bEsoYR4OZgFMDaDJtV4iqb1Yh2fYioKHxdbNwsdhFI0GB3rFBIftOnX/Vp0wJUm/Hxsjca5Va1utSwWhSTdrkBEjQq8ioOuMjWdasnPlmng641UCoLOKwsS0au2zfm7r75YQEUID1Ux89z/ni+XZ+fdqEuOJMNj8Hh9T03HEUbvquCd3RtwmYNtdTTDmjEyIu35vBRcD0KUpOQ2x1TejLQrkLRo+CC9he0bu5+5+FT+Jc/e7EfO5+wc2eK3viNjZkY7G7uWqFIsHY5AkhvS1jSBNU4CbIVlJVvp53KuRcdp0FbWVxst5JEilXDDJO5nRu7NL9ym9yrzX+bDYmAu9WIWpKL4d9E9mmLvDrwJ/74C0pheWNtX0FQznQyh/p+f1zQhfDtfgvCyh0uWFmHnEZCK4AFvkwJrev3dkw6aPlZWqoVa/TMUuNIclZgGFl0W7RGXZdImgBpyg03+lvTLp1ud7yaXMdVWnmva/P89fODHnq5wTAoPrqve1uSySIRscDfmHZW/k1reIgaXLo/gpc00LbC5/6Z//wuP/np+fZeP0mXNcL7d+933X3xbx8AQT+uwuVpKIAf4a9jhIANhFgYqKIPLoMIu2KARvMIMq1JY+q7E3/mENeiCVNSLIIxAHI58iYgUUwPD3s2eBCXzhF8pNLC0aM6gcM07bADpyKX5busVKGJa9K0byIA+jg0JBQkJunaT/8EH8a7/8qbj/9LecFyrdEBjp/r9QKOEVuD3G0zI6OBk9v/OHW6aT/ZbljV5ZURDRxmZB4TcpNuN0kJeALOZX5/x3uVNsEkVcbeR+y/2rE4v21y1OLiE9lwPLG0M4d15oY5CysgDhzKotQC09iOXNRM7GxtdpBfRVunSpiUcRnaOPnkbKSC16jomyZ59+vGC3/oYXZBKhAJ0yv2OaxskgBhEVRDlEGStF//8mTF705Ix3koIlWUqdfn7RtQyLJpYZzzyR92U2Net2dLtavDeSECgBysdfbPc+P2rt7tUxdOp+zcdg7dYGswrOn84ZUQJivPXtFOP7F2NVmTmNjpZFqYxiCCkESFb/RG+5RTFPE0Rcp+F0Wfd9jt9x/TH/7JR/FH/+set3pmdFbMWmGsGlTKKyB7nSemwDfojRcdjQrSdAkR0QmAZeqn3lVt+PWeftFR+6bo169ChFKpKLuuSJ7Ec7P5+yfb+xWlSx0xFzw8nYJC+98OoKJYCh1D15GdoWxnJ+vZ8u7ZXv1H2HYXgB8fqyoK0JXdTA768ZaFJzMroFZMXw9g/w2ZTjqOJo9LdHr16PsrTPCm5HbfufztTWh/h+a3xpkvIuKoWzXJJMUkqDVIlpPDPrGOD9X2Ws4y99hMDKiMpMt2n+u3R744zjy0zDQ0xMStuZWekyQNOFrL2nJYtRXnnkN4/7Rt0VVXN+B34uR3/eyd/MGvX/KKz3+PmnXZmsdDERlB3zugtXQ9HeWylnQZByGHm0IQKUxWDUbOY6sspkLMRkxzfh5sepNwH7BACBa32ApDAFMuTx0RmxEwNDbfspNrt0sT0mElKDumiLIsZUmLYXXIY7o2CAxynFtKSwDWACU68Di6zogzsXyc37x7t9+sRy7BCioJcO12b2cptxYNEqUYiyUaSWXZPC+41eo00fbb9LBlwEhjcWBCQ9IbUig8RQpQZG00Chb4ELm2b53OfHpSw+AZB4xU9kRZtsMNKG64s7yV86SIMp7Q4PpFPvjpnfzUn0Uz56O1QdfDiAb1FCXVmrZPt6LWHaadtsVf8856m3duY8yPXu6917anCByipFoRmg+rIUNgGS4Pa0/MxuNWUrhBC23ZrcsfOxqsKpvKnmojGKhDx8sjEbRZNTiXNsgXAjg7rPtcrA/nrqvnfadOveBx0zlLhJUwVXJLw6pqMR5rKSnDZGiNPsQs3+RYEyusFmOXW4xO4FylCBGBMqq2D/ffvv/U3PfNC9zz4bS525myGEJLeTujwCCD9ytUrVghQQV6ZWuoGrzRtFgiMJ3O46tehcJ8UK2olnDxWe9pcNtBW9EOq9NFIl0HhOXVFQKpShd/s7hQmxqio2mzEesOAZhOHUVRLVUqI6qkRKDrw3DfbzbfmLhE4+N4c1ARKV1I/aYOR/MFC0/5JUyi9ATSGCk6OilCESN7JayuyXHVSAcjbF3DSQxFWTzVEq1ikro0gRQSi7XUAg3dyI9GCG8mlKWBx/8fz3X76VW/lltP3v3RUiP1qvE4hFUreCBe1hahZO3pz6Hbgiy5+SkfrKGhr/jVu/nfP3+xC16cMLHZqO6hOBKsIY9N5qW7F7lW7JIKX3ooM6Qkp/nuwmLdiqTQkkbQmp3FMIdOTAlQfIIw0v6pUwc0gAniS+dyRaBsjkDgO6c9AQVmL1VKD/D0o4HFqajCqQckcyztAHGARp2OBRMEx5Vv9nH+fXvQAXZuBhT6wAacx8O8L25VS/WYaurVAn3e47SFs67DdGaV5So3KLIj0B8O72xZwSRYrAzgtsQLIBTEAxu57QzOf/y1VmgUYpzjorcBdAXA3CBsv/uTJWAqRG7beof7fPi/zp7zYHZQdfB3azQRDTE1QZXweB2qtdIU6NJ0RC3i9njqY6CKsgASSAGGFQMck1ZhxRX8il+NxQ/O72PH8mqbnSW717x2CmsmMPGopkz0WWSgB6T3Vqduwzu/FicvXJ9yy/6Myz9u2b4tLxcEFQgV9LE4TKSqaD7mdU3DZSk1xk1hijiBXj9bTjbuOt/9fcdtw6WBlLrSZNw+tCeOV+O4yrwHlKUbMS1iJQcbCEuIGLOrNDNcB/ID5UTHu3u/CFiDZplq1YOFRGI5FYSjdydbN6YdRpTSqdkqLgPEgYiw60rx+i2g0K+BY1cv+IX8xU5XIoLC2v6UVpPSXaQpgANwONLEISCA4PyhpCdTACkpgDRJw8AHwAMII5/5jBTCeF2j8X/2+b+rv/KXny5c3BnCGzHJ6CWrwSPE+1YIMUlqgxx+3ViyQyObtG4NHKnNb/vDh/eH/++FrquTZxZV8tYyEQWfVAAqFaPfctnuylJAKEvcEnmmiLhlkCiBnKJOsCAikkyeEJHa8ZM1ScRcnoA+HZTtLV6Bhc6C3xp7SyzqRKIK72cA5bRFfBiytbALi51oEWuGnBw38mSrW+v2gFeicKsFTGer9ns00+e5Kc+NxdzoNNObZ6eWjQv9ea7zu/6Ry4v9XM7ts65mqxwUkrvSxaJlGFatxCRSSFNIcRRlhigx5ILYup2zf9lxpvuqquKUZbvSwdBBV6BwKiwbM2BwaF7the/83ebdsXHPTW20VKHrCUKbCHJsfVjeYojd05zEAz4U7KoycPhY6FIQk4aipfvatrK39XBWXiZC3TXKKy3lVJNrM9GfyuIep+72h/uWOmN2p6OdeM3+nte/3zS3lmXCeggGVhN8DgWLLV5dRYrVMi/CmvN4PEqagkPcbkXbcXj3Oblrfj///2NjS1ED3VCjKvUwyHOUaq07CaHTm7ZXghJDHO+CSH0Xshk6BMzDP6gnlU2v33BTpqZAQUQCkTDyW+68Ov9Mv2iIv837ny3zesA5hxN2PWPf7qDQAZ1wZfSv+pZyKi0BVEt5lSOqUFTOq7G35aZpYsgQcSEjMGn31pxMsjXXA+hPkEIFRUDIspED/NgHmlZQAWVGJkgGvjQiaZgbO7/QR/moo48P2z/Nuo0n7ZEPachBWNzCdUOcHhXcqH2zREaE57U05t69i3/zX17yzrjL/GQrDwYRYJ6u2dLRsVgAXY4DigDvRp7mUfgZIE7DQpR1VBMtCQ8cNntjESkCxJhaAgaBiIAYlyfAE6GdQ3J8auMBrWRFID639BCDaDGZqWBxElH9CI7dUwoIzonsUsaogJyOthKnwaqFRqUzuGhz3jGASujgXFubeqoXzJZ+l0mddi1OePvhjPe9ff4f/PgiP/nhJT/5h3f8m7991//85+/4N39+nx/+s7vc/M1p57vey3UV8sS9FUmQCVC1kpQl065jLSFZnXgDhMbW9oDH2vwGjctTxXHqS5RQAE7gXGKS3nFJHqEFjXtd93zC9p3uSpe2vjroaRCB6YjMG6SE2DXA1I1ZskiJAqTNChLSciyeSWLlmFVsgx2DtrCRjXo59AyDlIBCo4Cl5b2ocG3GiIAHBEU7aXx6lzfpXju7iVLopKtvn+umDxvnaxjZkQHjPZNggoj43APVMB4YYggDAPEiIDQfFhzTuamDb977v/kbn9nb9p/An95fsPncIK2pCU1ThIGDIYVGIwslrvZEMvmNWlSixWlYwgTG332bkrmk3mADlIpq3NknxV7fBM3lqvEjpAGTlTsR5hhP5uFv3P7OrUNl+98YHCM4QGSXZPJGbzAKQrN848A359r3WwNKF+C0GtWkVF0BBbp7z+/vBy4+rIApPcA5piJOjglASd95CoCRHzEVlq6GABWLr8xKJCudht6KygrjfFzrXV7wrrHQHvd/eKrVXZud20YhHWdC85ZAwmpUapUk7a6uRfApC9azoql3L/Vb/+PFPqx77p50pFJ2o8QWcKVfIkcQXa4nJQYXSF44X7puGgajCGSqos0CyLVk9h/qMiH0S3vuRJiQaU6gi07EJuILqhJQeXkCqGspZJYSYoIOgnBCo7jpJ2PtyO4rpJw6QylrnYoCAXf562R66JQkzjJAlpDioMFTn5UlDNwom16nHIzmKjz3xeO0Cd5tYTt1Orb0+kw7Zqv9yd163rvXu71/vdv73t3nQ++e60PvnuuD7+717qfT3/Fw2rXrKZe3k7ZrQyvWdGY1WXuaW6dw/aqCSoPgfUGy6AbXuSKfxGjVXsj++hcc3x7+UDMZAEmcsLhz6zgVLrEC0juC3/3LrE08blxY/4qqEGVYZb+o4vC0MisAp5S+pJj4JmmSkKbkMeRpIiZxQ5r6HGNqsxUGxtGosX1Ljc2seyjzkFMJaw+1XKysXK3ReLZRHRphMvGIItyGUb7Da/Hcu+eRJq846Zqb57r57cbZzYLFErxUru2ODKGqKppLEEEG0nZyBPp0K6RHZ3k4M9zqB75+zz/1Nz7z96zv/Zvfbd9cr8prKoOMCBntrESmiiFlyWHT0EqdJWbLnRMQZd6eaGgi4kQWMsmlV8OGJxs3Fc+SD0iAAAT28o6pFFmSE1YtDz96s3XQ1FCf2Aw02N92GOHR2BnTup1d0a/OI3y87Whuuzb48XEjIEBZp42+2JaLMYThs5iA602HN8NUxBU4stjdDH46FWHJYTOoWDIbSeb9aF8IY2NUfakmBtU6uOulhwg95KlVDxcDZflpK1nPCUpYxNRJr1j9AKbBuFyx4h1Z9sH+2BGIhJ0zTy/+K//zxb/r/PwX7I6q4khjXsyr0eYa9EUt/YKY303Poi7hRTIionSAH7E4WVWqKT4a+iZAYoAoOyycfH4l4QSvi0WOVLroBA7AcFLasnx5AiRbY20/51HdPwiJtkZRDZuejBmraJZR72kgFSEYRGyBEmQ0KsANh8MhVHjncAhoicLH41jGDcVc5/FT8Anee96nTZ1PntLGsWljt8+1pg0tvuS7+AJ3zPe8EadfybucN528fTpxZtoyOW3ptZky1+g1tco6rYuOlndrqs2YIc0LILVCmmRQEhND3Cmt1nMP9kc9LWMZMYc0Zkk3ToWlB2sDBvGQ0soL9t0uOX955yaaVg0iVWuNyDU+JtK+BjLnCtdxQ5omaANIaJqQAEU/qMCNhIa8fd0Lx2Lr4tWzQja8MccaRKDn4mUllr3jFCBjXeKl3hYveKFuHVx6xcnX3tznLfdzM2uvGDiFej2NXEXuqgqgompCmpAmQidYo2LxEGfB6u2ypyZ/qFkm88Df/tg+/tP39Pn3jzp7+A33KYxI2TnSopORjXqwdkdK89kuEkyjygakMjamFcxkZWM36V6vBi+DSCBi2MQ0REpLF5y42d5fdtaKml4zvvBAb1fiuImz4pc2EaDQfYO8+e5ui9Panxbpt+p2c0BENy/vfWOT+cUqFjsEcTdPACcwpMdaUFIRemkG7fYS1RLeIc364MpSqphAGI9b3kgrf4u7Xn1/4m4/4NmxY3X/Ft4I3RDGY/CLHAhxkk67vbXEE79JBEcLws6phxf77T96kTueXvjia9UaVmPb2xPfzhrG5A0hr8xRli7BMfLi8CAF4JCn7ehTE1oCLHzcD/BRSRAm2sA8OQAY9gQpvfFUzCxTTAAqAR6XI6BLmAGO0R2tu0tnZBMmJvLveqPBBxSQ19w4Va1SGKuI/K2ixiodj6SgqbVZ7ABKvMMX2tIoLwIjVeJjumc7bcxbxmKm01XIqFnQ2TCKeod/9PW+cruaS7OamFMNXTl2tNtF1aQoaJ4MyiwTKb2kuYEa0VjnuYf325deTHLh4gfAaRmD0wKCk9gmGmV7rre837wLenRo1+25axUWX6tVAyI8FQYZUNA0FEkKRIG0GZCmQcNhjFijmN/w9s0+fzJMEwbc7FVmEuf+RvFBW3+9BZKQToDjlv4ubq2Xuoz1wkNZ+xM/9drlPrfeb5hbB8VgKiGM00omVDRbMoGjaQFQDRdBVSDFoUuN/Kf80syd+cG7/bm/+t6+8vGRp56iRgBxyMerKiSMWSysNZNuIhIKgZydy3NgD5jK33nTswnXd6GYqvjCRkbCKLbD6aIT19vr+t+bYdSrpDsWXLM4prnQ3u8j0JV5eAGlQCkt+KInnQooYF1891gNr7YXay4A4qohCFQAneUsDHPwBRffQeGbACJYo1oLaen6ns5jL+GHf/IFx+e+ZjzkQLvwzTCmRgHJu+nFcV0ISVr2WxGMFA1PCxMfXvjX/teLvufwQpe90NVlng3tdbG+m+a7AbT6u5oPcSlxOUAugBuRs9iVa43NtkYMstduB8wFUwKKdOqa9AwBmFnKRVmK2UFaAqgEWF6OLMOpg6Wb6DTvYHoIrsxK+7KFIRuJD9Mqdj+7Lm2YXunJeMSBT7LRZEsnxpC1FzHU0iKNSo8fdRmvaWtEpkMWMB497zkxMNH2yxEl4EUszpPj4RCPvYyjo6wVQ9a2hgkNiYs0TUmtkKSQaGFlfZiTjQzURPoMpbB429L8qEcnu9VWBEh43BLmYCztt8xxaosDlgpvZ8fGKZdcNs/121U4rGXFY9qZhS5XwLUpRy4rK4YxCatRIA1QpIkHYudiFw8qf7jINVJNbj3TLzqqba9fGaI/He39RFxkq9RN6xasqaxGeKd9w2H6AvG1L3YN3umVbaYV2VSp2jV8l+uWe9/yNDdzaZKmKshkkpeTqqqgqoBqOMAG0lDcdDSWIw6oGAI+iW9Dmyt/ylrkH2Du9Jfv5R/9jff97fvzz642HRNwmOQyuH42dcQxiwO5zLJ/iiLpzapQd6RCRm+7//RV3yLdPHtz16/viny/lASq6Y88Oc9vTjvrpjzNjoRVe85zZCoVFEXh0iVANxIn0JWeLkpXXrHtWrZdm/Ony2NWqMr5XjmfXWWBL6qAIUMqQKByyBAcMs12x+6QQBiNmlRNCtqDdQ62qiYVFClUbR+hfMXgNX9VqsRKo/qIZudO97n2dP5RPeKgZzzLbq9DrKZ0Pbu624kFtgjP+59a4pqG2vbe00v+/v94gXceX+Syq3B9g6d2/Rq4ggmI55tDZGnHLjp8WSwSaS9E7FxmlmgzJmhLP6KdnKfphY7RJK/CnkUVRInI4UBSPAoQgPKPA9jy8gN4J0S3siKQCYqZTkTXMH5pb6HvRu3IZhJsQLc1O113ROa+O14fsUPPD/P9Y/Hw8uEHGxVVZUJ3QoE4PyqzDLi5u07pckpjmggiIZI1QeRaizQi5dqCtoZHREbYkhEjPxBRfnCNksYaW3hwpDCwrA0rkCTJDZDcAGV7YJAGziqGEyXoCIU0jKyLVtcHfH2v7Bn4tldpER6XoCA6gM+As7yNQzgXqFAGviDNkg0zH+d6tWGu6aKgqN1yyeW3jjLInQCjlYHNSkjEJLghDQBKhhjoGiNP/OAZPkS4P78V5yyNc1+KbW+qa4Ja0Q62hBWPR+EbxzpozailHV53spoG/a44h3uzF7xsejc3j9n2dDyxqmOWKu56/XLPWx43zI9IOD6Y2mBUcIeS9u/XEbdNjtDcxeU0MiaxShR9ljUpqlQq1qaKsoCKmHR5vw4Y2aQMrIfqrHOnvnj5f/ZXXvqFd1E/bDpY7N6EKPyMin4RgQPKhvR1wQXmsmTxyaEewCmJHSCLlbtUR+ufFzcnbaS9eGnSSOyks9G57EvYqEUw9dQjD2HnSs1vyg6wqX05LgSbLPKiqCoj6dA/9Y47lvjWT+VA8z4MB/3mnsV9aavB4xIchGZVquzGh/2+ShZs3b1rLK7Yk9is0OYIUghOw4GIHHtTjUO3kR7u19KUKyJcHmGxKyFzXFmSVYebgB+HO8bDkiw72h1boRVs40rDSb2rDTt96rUPJ8b+ZR7zHNM41RIqCKZB2BU3mkIg8Ez6b/fmC/KF3ed3/S//83PffvhrnvbF//5M5hK61SyhzkaA/SRaM5h3dTks9JSyqORKSikBhSSiGo75NVgsR4Mbej7ZLTy7HNxmqiDJRZgrEUEZvRElqSJg3zcTQ+2nJpefYNa6oHaidfo+UIkm4fVoeEii1Yi23EgIqIAp+Ze1la895m6xQrawNs1v1TMB5IpLhaaebERWesQC2ZeVeAHHgANCp4xSNlPl+KSs81Ll7D/ztuFuJnmZMfKuGprQMCe5AUidB2K4+YpJMTLG7jvjuNW36fNebWe94TowihaohLaTDp2g5ytNOocZlGUYqCc0E44+O06KI3e98LJxwrXxS2S3p2tJnN/s+lDJEHy3kDcl1SZLugxIUhKTCMuplt62Bqs1rbhogB0nfe7+0RjMiuHWdSiPMU097kPGew26c8dgNIQ9VsjWwfFF3tbPD+et3ty99uV4kF2bn37DfMbN9xtnR2nRYHeHNFXCZNhnssi5ohPeatpgc1NFiLhcoyflBloQgAogSW1gvHLzEfzkS1ITdzz5gwf8+esHvvauYYtBb3tjBSDdKQI4plP52rTFpXPLoC2BCzn0WznnRSg0pRgKQgDyxCeKiLl7ctb6zY5Vbl2vHUNuHtm0htA+TlVVYAG590t8Z/a6FVSh+1rVfO3dc18vf7rvS8t227VANT1uRBtd2Y03zJotC/vtx9u+xTnX10RUKuNyC5k+4wiZ9I5dGiX8sfKKZacZjSG+voccXGPxpe0SrO2t2M7KEe2SOIYqToC8C359fCU55EyuHVe+MIQS69SWbePkK9Z7nYf38ZXDjBZFS03I98Pj9i3yTZhOZRSAoupb845GRuvc9qeP8L/97N/62z//ZU/4XLi4w+wMVWceohswAed342EZocyyW8RT+NJzkObHLDWd7/edy81Yq7iDKsk8pBigIU4gYUwl0Dw4s0xfh5JvtMLEXpaLEVsDZh2gdYBXlx9g6ARuJn6fCT/zfmSuws/pQtgSOzdrYcM95/CmFTMjMK1yR545Jd9xltu30MgiBzeSrBn08CWU3o/8yEORQyQDAzrTQ91uiIxLIhjGkl9eOH+wbA9yp8VhNQy3pcsrzqUeR4xUKznpCuu7NXLZ4MIzj+/zL9rccF+LGN+ISrQsiB0inNngaly0sDA9moZB7zELGmecd94wu6gO9729kiUtBuxiEYEC0iQlaYZbOTgQMCDk6yZ9syhk3eabvPCAzzuBc45czShqMM9biQKHu7fjXu91f11Ryf2vle61BoKStdeF4ThnWSeO7bRUScgOTQ+cccN8xi0fN80NFOo4lwcNqFjau/U3j2LalttCebujaZZVNnC9kdmE2wbhoiwdKhjS3LXGcZp7v3ti5LrqQX/xk7OPXnZuDpXqiY9XCyojTg/0BCVYgd3IZcz6gYjEez1LpaCVyubsR1d0Oi2K3Di7jw2ispGiydrW3OzYWratxfzK1aYRmpa0Yt9YS46mcWzFeAntcA7QEoK82mysGr5Rem/p+9Li9GH3tzaZs2gVQxNSjwnzBdDTLDiyrqzBMuwRB0ccRWEp+oyvavVj4mc2hl4brg1iRiUMod0ekZWjDCmGFCwOkEzw5I4cxlTLiZHWNRIt1Se2LVdsL/6+Ny/37bcXLS910xj96saWAPESblCUaxC7O2K6z3nWArqw/fGf940f/rXv+sRf+KgP5E9Pb7SFZQ8BGiFbAzJ6OAc4hwcEipJi+0bbuaxiKvhbdmMryhOaGJnSBM+oMFEkaECJ0AGZxADMUzVaA+iNXH6C08aRZyp9n8bZji+TCQgWLN0j/Pa6O9dq5wa+ikPARJsdL9NODVpxl2r70n7bmlStjssQdjVC15V5AaOs9FCy6xlFEYeiwPHEfqt1xFqd4ZFhBUMrsArQxxGH2EvwqxM6Bq5r60e4dTju9+rjyzyU9/3SLl9dqyymSAm0qgA4nJZZNkk9EgEzsp128ZjdebKloCigWBkvsoa4wh3xsJY5wC2KO5CKX1FBAw68ba0wNyiSL1isc06vF7wSX9Hs6sO+Q8JKR+SwpeY748KyrlAASNxIz28tjzzrAw3XazxmfaqcSrDYoLvfsNzthoeNc1trDTIlqIBHi0OGQId+p6WMm8+d+f5T/09/s/NS72he6PV9Y3m+4BAf/My4/7M49/nazIsZUCciPFyTOBTg8aCzEufFh1bbILNyu+OZ1w994/ETW9VQciVANdktEiCkJQpdqitTIqYT3O6VAqVoliMpk/7Fi7UXoVLcE5QC3xcjoq2NWzpn8WrnRmzv56bCehsKTVAqmjvSO5bopgFgEwYt8M2js7WWxcZ2q6K0qnD85qvtgm2bx+udm4vdES7aKqJkUB5x4DSkHJfEz2yXmIBtttspiiQWgaEWC+k5X9J0AFEgTVIAD931kEvsqnzZmFVc+VWNKq2ot6o2/f09b6IatAc+k4bIcyPeGS8C/KLRyr7b0xhnQyv7rndPueZH9q/80jf+ad/88T/t7V/4ufu3nvsuQNq8gXLBa7wDEJoXUBTFtnXuWAVrIAfQg+VEKSWHm1JzzOUP0JGPkDJ8X04hmVWAYXZM2wCsAfz9efkBlq2QborpfwK8DbMZFXk/wtr8G512YzV2rCHqp0oyrf5aM2OlO6kYniS9dP5s27FcjX6k7Qxol80EoKAsBSQXFmvULNANoSvddStbQNEuwDkc1qYC0m4It65DTM9Jy41ynxrQlsvP3zy/9AvjlZ8/n31gvNKXX9U2937StgYhJvEIDJMomHPxsP1ui6NPEYETtz/Obb/MjYdS5ogrB8m+y5UIQygHhXcAAfCBGGHkV0N12YFrK42s24GdW37Yq37Iw/PZT96orb11PkOB2MVpQsrlhnjy/HA7P4/zuPSeAPKWf70L12jBZV0lxu1brWpt2cB73Njvft3HjXPDW7xcBghpRTWEUEzCeikHZy98f7d3cvssG5UjZ8Nc2LQZdHtqt/XY9fv8Et79f7/c3V+bROQykkuEpiFba0+d37d3LOu1jLOff/moo6saWJse51nsVCAQx4dzhWiKiMyiYL4lInMcTrNMHk7bhdVtzn0+FZo0V5TAl6QdiuyZHeZZx2NHzR191wjTHmnsptKsC+kSWmOvgL4v8EKkw17QtWy7Nqc6qeL/nxWofOX1Ov1QRxb6li0GrI90ap+yI/D7eQ2NDHHAUlO8RzIvWCCWbBuHDzrqhJm3undUsSaQdj1ocQilyx14KbTt8wEpKUv6tkdCRR4MBCWi0VhbY0PMtGPTjuPJ555P7dXLPa25Zq7bWmEkyJeKrYhPcIe7a0LAJrDgKW/89yf/tV//+j/za7/5p77uszN0HV1XaK0osjrIMoJn2hNAmrhAiL3sOMFo0FzHSbyffPh6U5YTU1IRPUt+10CEmByoAUoJIQhTZSrZWsOmFeBtA0BefkyCg4W4HBKanzcECfQhKCEb5G9ZcVEKmDzCC4oGSMpcak62yl52t4K1BFTKREcFhHyT2sYIm1kVEVleBgsAUE/MxZRlgyYYDeewSMYCl8fWWBpPgoXlSOO2G0n3NiV4HfAfIj3gFBnZD188v6ent/f65PrAF/jg58cjD7aXOPvjmcaZTh+ZgE/SAKI1A2LPh76FstzEbGS/iNDZ3W/ge77tcfNczIw2WoWCLXE3h7LwwFPCaNKC0aQtjtFIXOzz4/E4PqAl5KmiiNE5R7aHPnd+hc/fPPRvYAZhoEGqUAmTzOLxc/AaPfuDnxWns5vjjqpWLShQhsLIJzHXrrluRVn9yeMouQQn/o+Y447AWcr5ql4IgcU6zlO3HFGbRqvWXmY781x33jS2O2FiOnl7nLhnnHDlp7vc+euP8A8un7aHauGGX21XRHg5cUePNkEhkd7erkYtlXTWY/qQ+76aX1u2bQ453upaAEMGEeCZJImMtcjiiiQxDQ73nUQZNv0NspSKabaje1z/rNrnBjkkXGZLOWNq4MeHr33Ei8u2Zat6fb16lwYMrwMnWBuqECdLaPOOGOQTpbw66NUfn2WgtPSlzSjHPYKepXT3jrBkT29wVY6MFmKqT4273fZu9uKPZv6oWz1abQtrGQ1ka9QCb9RRGTdPbz6+d6wLv91GsHV977YPtLAu5W3jhW837UKY1cdPHu8KTV25AA73teb5ZtfvYGwyWdOILhq6vGOgBahECm8StMPV1Ta2b864Hi/8S/cf03/45nP7B59FS7d1Y7WqQkhCio8hkK5KmqykcpT0A7Bmqf/Y/NNf3PfP8lUO/pltqFGAxALAZVmZgx+NRr5JCVyJRp6D5OJKfMaoM5bpa2877cYw8lZszbURO2OKeCr7tYSOt8W9djECsP8fXXhSAkNhiwtA70nT/x6M+T3wvs7X0XVdWoO8YIt23Lckm480v6wuZTdugDuKR8AoYsSqYBmoRlY7oLDQCQpyelg8EwpU7xRU2nWpel3IFgBI9JqGtAQlhS6V2MjRssdjkdMylLcqYVItSYfV1bRDKR0vaeLHq5cZYExNWOdDT336+O7b3t394+Wexas8g3MXYRudwXJSM71tZcFhDh9O0sRDkI1It6UzeuOCoWUCBquiXLf2ytp4nXLl4+btVO2RFm2XSGiHrEvOoN3N+uPX71jFNC+zkSAcwGAZx+M8HeWFou1Y18MeOz7wsf5yn2oXPX9dS+Xj9rQvY2LIx7Zez9Xz2XmIalQsdlPbhG6t9cgItLw2Yt0WC/WgqL4qgOqrq61PC9h+06oiMqI2tibVzLXgTImZ6DOaZ+l19ZlW39BpsxN118uPn9pPc+6a380LUYI7lLGqcJOpkzQ9HBPIn3rOoWnu7M15J2hTTzAwTTVIodN5ckqaunTYBHx6VAWcxXyYearIVjdO7E7cfn/CuSOSAfJwe4gPO7djUTtOud5SVG8zAeuxBxygRYAkTZrtVRoOOH7rRfdiJfvvvvqIrqXb5tKAalJlV6JQUSndXe3ILvaNjheFbaF73I2/9TtH8OH8we/vces3G3fKTjhqwQ58pBPh6/WwIjLsFYURLHXtbJlU6A7/GpeoSt+D/3Bw1/Hx1qeW2mI5QhT0AGUXAkyLskwcxsBKxOuHx56JMQ187C0GoajlGbXTdvG5vu/pU/qnH9/L586PenkONYfEcbUyxidK2BPSJKwkq91x6lZtQczulkZ1tYf83Yv7PvD+vFPPKgGraepARuUUwHsvTbyDEYsFygxGsHZtZrHq1/ZjVCmBcJPjugoFnwAlmGKoiTkkQDoFWuwPAVOaR8cSZAYzUZoxZuaSv00f7IODrp6k07wDs1qFVkN0hh49q8huHLLRCfKJHJHbmKKpHldsLEx2Tl4jvpSf0/7UYd/k7YCSG0oAELmyLoEIZgG01iKIAhkBGOeIdI6IZKOyYqJQ3mHpCauIuznr+JDiI2FtJTcgfcav+z09/vSxf2281/vx8vt5zpJez0CNNsWypeqyWhDjCB4wWCvQY1wwtLAHYnDlJV+Pk+dOp27jyfNTAt4JZWAEJTL2UlONVhjHFojrIZDHRpDxqldSf/SUxqAeeeTy4EfywV+8vv/f7f+cxjRUupfJWhpLKWW+3ZedOm8lI6EFIEiU2di4jqIZ8ejuYE35Sph0IV2fg53boFWdUMDpCO0iL6QNPNtujaYbhQleN+lppAlNr6vPtnPL7PNH859j++T9f3HBGHQCTRUUsRCUIZ0010A3PXrzzdalVBnW0Faex1gwdsEB4Y4kNKuEOM5zOWqzrMGgNjrNzR7vfn0u2K+RRHZcECO4kF9wYD7hvNQe7UlAnKN5ypJRYAUFSim96pScLa2lFNqvu7pRQQFK1u6qM6dZoAClmtwcpTbsPWw85w96nDOTTbdoxOGgIBlEGDQEKJyBeRzvGTnrysjWGVpUn7+XWQE5KgMdUEEuqQrFwccFeajGK5JrlCeZVcRaMo661DC2jOIut3x4h9+H+z5dL//N2Ki5ZirJx3u8ZAIhnfixDz6VsXhI+hMjm7Xbs7/w+lUO/UbV02p82QAscIArARGhuUDpceDEIQ460Lnj2kY/d56cI9QLGhHJEYxKCIJIMD+6cOlrF5PFyjqXBx08Qvak09JgEHV0qmltALKekIMOlLWK2+3bW0EoU8lH3KSSXIID8gjSCHylxo6UsdBiQplJjMIu2lIeMt7dPe6F8+3IrIqsihAgAIa6GKIAKnxYswvtvk4AnIiUYyHTIWvuwipgke8EOk5Lg9hA7TR2LbDSaM4v99Lxc/XF8b6e0Ms8Wfc/wMi+zYIDBpyRywn1XANyfDciFGmAoFCAEDAucT8BOMl/w69x15s+bdpDOykDLZ5YeTyJ/aAnMZRZXmYQM47Bg1KDTiZ5MKhliVsWmjjnjXrYU/nIJ6aX//N1/sDLD21gtZsjxMs+IZeGa6d8Znu7UGtS0kTesNZbdWmhN26tl0FDlvHDmmOw41c2swiIVIF+Py0qBQsOzLYR1e1NaA2UEUtuaLWYa+1+jysf3uEPfdquNTKiRMxSeGKvTeC6GecFL81bNzedLR8HqSb9G1RgCiTs6qT0jKUqVCorxnOdtmHkcverPjViRLghDSBOD4tX1ppRnfPSdMbbtpn25TYHjiWKZKl1J0C36emzfrMYfRvO4tBoPDwV1U3H6D5ONAuloyvgfejMVtUYLDUtNc26qoFWLEcgDi0KFxcAfgx4hdZu6BRnmFrwSMxAJttEe0iprjagJPYGgqclRtGi8J4sFuNmcV3zxpg3bT++2MdOatMf/2cwN7iuwawKGjovgE88IgIhDTmiJSWndbVz731x9kuXC5aPTy7Jc3zpS3qeERe3zPBA6fBYK2jUCXLJzv64YGn2OiIpYsY5QhiKUq3FpgZJq4lnYsPNP+VgAUEPRsTMyrddpx2ta8Dp66niCVKjIV1nQswQ4bXMbyabsBYYYSw1Oohr6QRPUVqo1PTGxDZJVE861pjGZslZ0VGuMdKuUQ2rUl9GpaAKYOSAZLJxUlKBD2dzISiSETxFe21tfVqL6rgmRWGFhCRY8QOXyTI2XchRk6lVdfF38/Cl8+fs88/v8TvTKzwTr7z//IW49f1FlAZhg3DPuNuknmfK2bPSiltJXOuIma3ZOicucU+r4Cyt0T7f+/r7LTtVb41xeGIrErOugVhsoqRQqnx/rpWIA8hTlQAdjelYJ7T0BJ0K0sh+3uHpvk89X/hSe6W/auc+tcxARa9qgZb4uDgc67TPDSzO626P3LrfYWjkkybuqo2deVO72cDkzvLIlQduClOAU25XX/5ABYq9+hpMCzr2F5YxF6t187EC7pCm3LRnkGFWnfHOvvdopx+Wj4yaCch4DFzu/ER723r0amELqkYFEwVFulEAJVgBOJymzapCB6JwopxZq5a6mrBaIzb02pZzH7fsGUFK4qNHiUev82RFbD/N7UfnDdsedROrH0YFlmW/EyA2iYSkmWrUdYJuznQf1875anxBKS11CdqVhvPi3ZA9POWsyuO1Vc6q0DWaBeg//n1nnXVsBrP2otV6E67ykziH5cIvApxw68CB1gmL4ye1GYkEeZpVabVuuloFExADiZE1gMOp7xqUdmvwqqPp4ShYI2pqWjE76Rf47ucXvX35nP6vb2rHPqub42f4zHmf+8SzeKwE2uMk+NfsGodJLZy6OvfB64e99lsdYZCSlaCUGb640vfKUS67IIDHExG+BK9ITbC2qpPBisow5s51X3SCz9a2JGH18swaQphJRrHppmJqy0n1IlxVHqo+tKA606C1yHScc7pa1mDZ1RVLSSANlNIJvAoCSFBUIRpDYINy4b642XgNXIM0JbKVFdKnBVtqaQedyq0oAWtGsCs0olXYRESMiKyigM0IYHMACMvWETSoMZcEzkJEckYHdXjvog7aZBWQVVhNdGj16dSFmjBUnD7u7zx87r7hV3y8v6cHtguWpZ1WlEieGOHIKeqnaakjJd2hRZcefkKwAmyTifbbnsucmI1gbXDHiuM2tXH36a6XjM0zEcmi0U2quGgbA1Y9QN1mHK91xhATq6CB+JgnINahUMRy9ht44MMPF728POAr8YgH+kx9FVEa599Eky5dqRTa0RFFkG+v8sz6/lH102uoLDdkcVDqjzth5KycEWnBIatqoAg/2//kffdpKS944/B/W7nOlRKWf/z0AjqoZb5bJ5QuDF1HRBU0siCZHlcRcTI9qJlmBN17e9IeRKalps1AgGpoJKMYMNLRtm86GljXac2xcvRcK51CCKQqkdI0FEXcMU2YhuK5vpG2RvsyFdw4vtuwcLznDWq4nmmkq0iTwoAPYYTeUa229diwNaM6UIJDnACEG1j6R9WSw7tyhvt5uNFqO9f/iFbFWxbXoK/myufIRuHJd7yWOtZjJwtCYEuR65CNnYl4LSZrQ4sjGxsImfMow0oRoD2Qsg2MyBmGgWmBgpI5RGACB66t0OatmVGIjyOUr2WUaSggXuPIUYMoW+EqMSHd4eZzv/+IP3H38X7u/VkvvpxpVANrxXNsyAbd2NNcVrur2tLoDfiE1yzw5z14c9aJJzsUKhErVLoyv+YaRgwKt9TiklHpS19mTtOuoa8lE7RuBq4t1Ov8uravw4hTi/eOImnQs6/uIBKnNhdUIU0ohVOJe3+IYTWhFQrbNUUEQjuTXQOkqyuWWYeW10653bD4OFyfmHCZ9d438ZaSC6encAiUOkywJlJG/dbcFbSNlK4an6VQjcdQWRZffJFILlNT0AhBmOk5KtqAMeFqABkghmzLk45AAZCwSqwEjClRGqfC19aSukSN01lnnj9bf3Z+r49O7+vB7QGH2Kjr2UVWZHGhC07Ptjmjbu0fFyoRJ9ru6sTRx5WqnSrB6Lc4tlQH9FdTaAF61Vv9u07ee9o0y5kR5P6pTzKmgQAeIMenYRUYx/jRgdgo9t0S47f76lGHtoc+drzw6NUr/vW48LG9qltbI/FG1ArHb3jFyq79NBOhQxexPkr352pTBRbweBZ3Zkan2TEe1fRchfamb2QNGftWj7CuYlabWZTzjzalKizs4Li6MrKBRg5Jir3ttgf21yOieNg8a8vIANekaeWOyA2VRvMbUgPu926qSETen643VOIwiQokTeI0TUGpDlFYAPTi/vdxbma9+03neU5tS7UAip4Q26ztizFfO2pQ3TgGoamHoplpSqlRW7j/5uxkvT3LEV5sc0tfSgtss2pG5PyVskub/EJCsmC29AD6vhvrUp+wTqat5PGPRzIncRGJ2rUvc9J+VuzEx97aE0w0hwnAlVVeqRtApLvXjnRSoxyrkmGAkV0sobUaDpd7noVPrRlaAWPkUtVbmt358aW+d3vQgXylr7yaE/LebhNoaYUjtzhfRPBh+ZBGOU4rtcbWgy/OP6Rtp86NplQwkAN5Dld6ZNdyC/ClL66kdLGfxED879pxZrNbs0ZWLA9NykiX3ksSACiVNDZzmo1JLUVlBibjpEJDpg+hg0BmRiakdR3aYg6WXV1JmRLu1lDpHowLtlVCfH73HXYQFbMkd5LH/5EXm0pOpcXAtElh+ttXQGBOLubGJksopEmApiqRXKYCEoBCJNMMCowwKoiSQTYoShwmdARYTZpIfCD4qq9EbTkjmqiaD+/jpafP9h9vL/3I9D4eH9uW2ciaInHLE8/VPtXLrLS/1+H4kEhIOUyzo+fCHUsGXKE0zQfvfdX7uZn5RzxZXdGyHFiGmAogJhCDV1IMY010LneRlv0XrvXzjoyzj+bDH61X+as896X9TH8qcyNohZcnqURnLEI+Nekd3s7Tw8Nj225GBsVVY3Cut6m7ntwbm7uKNT2eiBWVVbQ8uKG7IKp6L4p2W/pFjJBxh5bcAGdVw2HAucKUZrqoTZwBm+BiBrIgPzmVsumhUDhXkvaANGaXBRFynXLWFdZmOssJ4zhtz/v6XDwpDh7AwfD6aHPa/tqiaujCfGCSgYtvI1pUApQQQBXYclHnxR8+EwEK7iJXLO5pilhjwRl5U1KUda2Vk4EfTItiEAFc4VyBTIHCF1y0pkKOhwBVQNbYTA6QOyNkRqkQPUU71hlL8YVbZ43xWBHTS0W0pJqygThQacUHO2n7+vwfeB/l9N7/RLOaBz42IotzcOLAIasdV7SONDbG+Q/sLzi9jVrkeU7TUnC7Ri6Ap5RRDjk5zPdr2/GdHcQ+ScpirNuVXU5CqTNnZg5gIsmoKmYHXQVTIeiqN/WD1IKkGZxopA7u5mDW1JXDWHRQVzNLSxefI4MEqA9A+kG+kriU0/CZu6loT49nJ4Kz6DIs6TwwITBVwSCIJr91+bw5sOpHBgNExAhgiLJYAQHImACUpWRAfMQErOGTBJJVSKQvPhBbURPaYdh+bp+Dv3v83H4pXuHRfv+Dx50DxA4mcU6oTorlrrqddY/gABKLxx4IQMeDvj1mwZydPNzrWm+cwHhskJHGWd8kJfEkWJjFjtijpBjIOqKiWXpjOO84q/NO+LzX1vNfbw995PLAB7j9UFPDqxrwVaYVY2PIvtWWiCiiTtz4qPbhoeX54YPHBjbJAlqgoExPnpo2z9c3bSzd+IBPylHLC3heu6B5A5qgq8ISHVehlOvpW+pAPIhAh/7A7dcdzE6uBREFFLsESByZq5FRtbSU44Y33iFWtAJLhyYURUGjgW6ij8NE3zJ5s2H606lX8DmDODQbEuEFjfNenxqZfQ1WNbIAcLJrXSQDvCqv0GpiW/rS1rUZr/aTAap0RYTHVbrtWzraxwPUi6zrwN5yWFAMnGiZ5o7Fg9z3l5mGXA4gkRyNdqvrWDo7G34Cf9cedRCmztow6qHfnipVw+s2paxRZHWu/5CR0cg6NmgkdyQaDtPSxpl4Nx+53HvPrltIMOCxl2yciOd+/9vZ7vSe/2+bIWoERoKBhotQEBQGIUdYU1mPel7bVo92yB4xGjUbgVyMxY5y5HFAnGuiwbqw8nzOwW7qrpBR5CjLSifMVrRkprLZlp967eKRpXPRfPRhJGEFUxWLakKUrsoplB+gljOQm7riGDpkvwKLRnJGmroMQbBKwgUpLCZRUKgwMRjP3BEj86k4yZTQ1zVeU15QWSnPA93YLeXSBCUBikgkIrK8CkZkLoLdEC1ARYkjSpAUrMNMkdEoQhmjfUYpJmQNAJNMYNVxfXc1J9UqzZjc/8jhs/kXh0/wW/P7edDnLV/KdADEWVnwtHvk/kSu68gDOS0f8EDXb7stpbtQV1qGqIBS7e3N017grnd3Oz9sl8Z8nNMinVxLFN5HeCQtHdkPHXEa+biyxB8nynm+3/69579e207gwqP9rJd5/2+dzn5xjs6qRtTgchEbYQxj06AXlbhcpTRhgFW7iPPD6vcP9sMFuTXwwAMoKPTmWnjiTMcWXBtP8mnWdYJoCGzW5yi2ffVKz6Kf9tsXZZHAeNz+pFYCZGHdktNB/1rrrrqYGT+FAjqrq8XFsGbPOi9fLRKk1yOSutP1QJJAAVCEAHEIcPPbO5GJxht6+w3z6/Pe8PANi6jIZe1EhB6QWLmx5UgYaCDPeaPxEJzs0p9CpivooPtYzlKXeilOe2lzXh3XflDO566sa9lolaoAdLDtKcC6h1PO1Y5O5insa7dvXhevRSQH6Cx3KGAaFjDhEoMoy75b8yDSa9S+4CW/9J+83rCoDYOqV71WRS2gkAB+pJpSiSgdgch8TiT+inVMuppPv/r5Ec/gHb9rZ1tIvFfIiNXqhk7d57ueX/e9/+V+FtaJy4Z55ZtNnSJ63nsZe2dVKrz9xLxwylEfymGBCIslzyXn0ShAmWUSE+fVdP6MH/qc70xByoWMU68855rLNkUzacSzOZuhJBcXAhMzkUgu6/BxzHiVtXR8Gyx+VeNgHyzWdaXAdYc4WpEDoIAYoYQMuyLq2PeKZpBOh0xsi0tho2Vp2cVZzWFdkNuDTmKKQLMMBqO1ycNppyRoLyNERFClLmTLmMYAQzMo5Ihl82RCpt3ORlk7i9xia1QxJMlqAsl4HHdBVBKb4yFL+Tn52+3dfrO9/NPauZlFqwA8JWlyF+YX4M1ddSv+RsLgxmkeBxZvKRQuXoAEVYiwYJMLvrzAW7bZka5L19EMGisnKMFSxK50iNNupUhPZ0WOZ9maCwM2Nvr8qnaseNvJfsEZnf3y4cz9+ZAnauvr1zaXGeOpGh7nQ4x1CLBWGh9vGfS4y87meHbr/HCetrmOWFTQ1B3fPI8Tx6rmvdIFK/e1tDp5ohKsQAbxQJUWEv1bw4eiyHlDoXRlP9EsNjnsP6aRLCIwiIQoEdmJTYQkjGptzYwObfmcPTZwVJsXg+5xeTJxETu09EkZ4IA0JbDYx8AgjnGDW8RNh8Naq2+em8+49MlybODiOR9yeig/BMNqumyNVh63iuEUFGSXo2hTv73m2HH/44NWJ3N9pcVbCu0GVu0CKhWr+PI7o3xl3k7aKBACBeA0dJPhnsts1KB77eDZvj/pVyyd9LrgB5aVqCA5AtIC7NXSLc/c1FLj+OcbVzDX9JpUEw3SUCfwbiq3tI6sOSWq4K37G8N+au96x7JszrYzKsFSpUa14FUzXbzg+w7nnfQrf+1qBjkjVTQReuIEEZwc99OFtdi5pIXB+GR0KufVNKd0GZ1RkRRaQf/IthWf+/wSajAdt3ykOu0S5FomFbSEhdZZiV1pBh0TLYzFRdVFQaSGy1u0dhp0GJxP70hbXIDX27ryR6McLOnFeyq9CbiduJxFhV2Vvzd2nTrlEUEhCpeCIhErGquR3nXy+mYFCMsBJ8AoOS2G+oOOhKWUxbCZQEREiWhAFNoVEMc8QXQVkHaRtdehX8EqrIK2YsaxFXKDdSDdvpVnLvkRp/RevhkPOlAfchkcIFkRauB07d919aPn5/WGlEZCCuMxDKtFzQ7Y9tgy/RYrkC+HcuQ0l5lJ2E4YNUPb3+6BW4XewEsPaeCoYWOQOzf6wrJ2rOXWlbrwJC84nucc4/mHccHBduHJ2nE8GmuTYTZMRryyRvVcpeDTVQg/UpJOtsQbtXzeOEeHR+X92cP173adExZLz2/u5j12eNNIKE9WluOtN31/4xQLJIMuP9mphoL8LgooBSgw7RtkGXtXkeBQDmsqGadI9135gakAMKZpf1eyvb0oDIhPNSMpUIkUghssiiGGPXsIXjehSQZJEnTE3Ni8ZdfzXS9iLwLJeFUSgeGwl60JZNalBXGOYbUrbyRFD6r1st6tBLzbWku3AF58dOQsosjrdfK83ZYGlK4A6KlkxSSOypP9tBiO6bOrrUiSdikCQt4eW+CMudEqKBUx4OY6i17hB/xffwiDtKTRE12JZ1TFSnAqvEeON5TaTdWTGgjnEuVxnLImprMT2zv8vuP7+mK74JWmmHxeecAjgAjEAFb8xBqnp+2nL6qmBcWrDbgsH1HIanAxkXHeYl10SHmuQ+HpET0qY9MeZdVhz2YWAbvda1xEuQxmAq6a8NqFvXsICNLSYCCvEMv5S/rX/v0KoKsrO8HqHDr4Bcn0f5myak1IFUFHcndNWqkRjSkVqhxhgu9TiA23pg4ZDuUXsBGggMA4QWOzcxgwSETaIgIgAXMBFFBaU1AUwPEIIwalC77qs7TEceULAw/LRX087BjOfGN61OJ00ZltOaI0QBZRqIJN8AWb63eun97dt7O0mqRRgJjWasdxMXsIsAUFK7CfsBg87kt50fK0s/H8Vs6ONFPxzswNbJZNx8NGg6iJhSH+tAtbXNjgzjXtWOf2U23rUm47ya0n+0Ur47zjecGb7YI31Vjts02vwVu1pQi5NGtrxZvisxGsWCLuewNq6LUe7vP74emBzeFC5R0RYMlLNoxiy/Q4cTRnSh7zzllxYKNdFzwFPssHSSVVyYRy2Qr1TMJ1AMSRIOW43ho6ilAgTZaWkrj3TKUKeGRZ5LXwMB6QeiCwuIAipO2AtVeQDaN9bup479vzD7M33IF3BRUUDZjG1nLHnANcxa66MaDaURwtybZ917Idu9JwXvRFAVXhiGFbb8O73lCQ0aFjq+VxpgGKsEuw7FkRYflzbTCWPcwCHlcoq5a95jDiWAuTdciLbqoK7oTWZN1I+X6NjGkbOHdlsMb6SEKNWK6PrR/uP7r97P/6dmIdhsgneTMRYXEhyM2qwc7T2r607u2O0lcjCgesxkgXO+yPer7t3Ow1pEUfQmxi2zKrHB0p4Ie8mpTWUBozxQ39DYURIgErcwvwtKSZ0wr0q7Xn6/T1FdQGHDyQxvcgaYmSJGJmOpG9aVItiRTGkp/IyyJAAtGKZU0m3Q0oea35JEvaZY4pODcjcxlr77DAAX9X3YiIGe9GCzDdCIvNcUzNzS0I+J4flV2qeDUhWU3jOC76fXx3/dZt6+uDj/Ksk7l9fehISwpFrORV74q1/NSmvSs+e0n9dDPTqhzXggm1pvgi7XVbFeDAli3zAbZc4gDctL2JfOn//fKlfuc3tUnUWn66HegL29gcO7dyx4bnt9CoozHQQh9f2flN7lzEea/j/CPeeWqKtkJ7Miw1mhjCKLSilWqkgMtxI433cEluhZUnwOGbxaAafNK5ylfk8eU6fPn++CSf7p1bJNLS0e+2K0+a2qtABFsHnGdwS2tAVroyO+i5SpKm69HnWdghAnRLdCjUq9anAwvoyUALCTIaLX+HrCrCSthTJM2qChDXE2/FwfWdmHgsEpl9VgehmkynFABJkoTEI9aePvaSZEDRd/V22zSJe9z0uBDrgWspEpy4vo+CWdEZuihRMUV6ExlWS0WhbGDoVZWGgf6g1cReUApOs9A0wuR8j6JkOuE0fWpXxzYDN0QQqxExgrOy0wgISRx2YfzE7pDAmipbQq8lFgfkGDk83mrfLW7e3Riub2HgxAjVJOhAiQ5C+nSgo60jYpkioJy7h2REQvLYUkODtKRCM3P3z3fJ9Xv7q/ktBhMVXltxOcKSe3SocNqhEvOr3ra62qZ1eHS70pc5rmT/ddlICXGIldRdbfTrYU83W8vvbo0V0au31i0TzFjNt4a8y6ZUVTErDacVwkIyK/PumiI6F0hL6FyDxbJys1dnXtzuy10wn9R0LFzJOd6ELcMC2W6UaQ0wAKZcThO3iecQSDJp0dm9rGXj9MDJPe/w3YDUGB9X4yZazTs2q4Fc2uYScwAIy5sqCrhhceauxFdUA5O0wmoUgMqE7ryzUqZ7qiW0xvlrfOSSvuIL2aMMLw68MVwkZJN64vm5eVfxl59Pd/XG3VhJBryFpbSLVadQOJTBcMKAnm+zLc5l5gMIxqpR5+7ffZwf/0u1kcvs9lGfPdSnhtpkY52f950bbGwN20RjADuMxlAL2mrslKZrjWmwFAprVAMlHL9uFQvI3ajHjbJmGgvZSBF1ZNB8J1528OnBI+3l8vKAvq7tlSyp0Xd0top7z3aV6r22BZErogYaWEOrxTA6CFQy6/38hYIT3ziP8v2amw3LhpaPXxy71N0yApheWcK07Z79IVShEhJQhhv0+30YMhyCw4KnaudbPqdLuM4IK28/JdMqR3y4m4RFsfdgpWJ6pXeXaAO819ITNkz22V0fN2/LgBtDr03VM6nljlX53jEQoD8eF82c/zH2BFClKh+/u7IQ5gezMy/mfA3QF1qdHz9+P64Aun6XfkjpjVbf+paCboRwralt0qbJ17VmhhsQ2MVhZUSiZEFf5dR13gsPZYFKW+STfNhtP2LWHN7nP4xtspZDRzzj8pDSpWlXVgIuu0m725KpTXTW1ksVFp/18t4X3bA973se3tOnXur1WI+riXL0vLCL1j4q6IyFFS4sh94M3YRJJo+m5mXm5SC4QI+ss/Xs5aynp5o3Q7OBN9CpDxk5N8wcN85tEYywsyi2nCxC9QwVJ9KYGU3UmWhtosIk2AX3qSUn22wFFrVtrM4MgdlayTWtyYykmWkIKSTcQG82H2XDMxqvQY9Gk5gQVe3S2KL1fQFMNxgw93dr2IcyXNzoClxPbI5dxL+MAMswg+BLKO1JMSLXXINzE98kEkyogrhDWU6t6+FnfNaizj4z13LzJc5RFU6eagMnZbyj8vU70Y/uWk+FkoyayqoORIGVUXDyel2NWLqDbU/H5aZ7phxT4WfMIbO5mz90p1SR/fbgXCAmd4CRJMUCFTpcipbGCU2teZsNOaswDcZHOFBDNbULC99nPrxCFy+7uc3Dci9Lekt73kvqpJnjXed1KLNCRm7T10aqBnV1pkCWjUa0eS5OcwzHiLzP+SuDPZ6N890JmPgJcxuG/eLgRg1o3hs5rfjP6wpem1Dp0J47qwqq6s47hzkw8lGmFWPiyLCGDb61jqhI3LVDbwM0L+I4NU2Zhl5S2Z1cFlENishlhHqvz409vuidNxEoFFD2FCf7KZysa4TDCUC4jYRkUWzBr8Q6gU+8436eIvOzvwnE2Ci015Ayk2pPPjfs9i2HVdUztzttq9HTA3L2RaJFW6SKVGkNtuPFncTB4nyJYXUn9E0UkPMbyeoAMExQ8XkjZqg5lxhSvr0GGOytFWkpMxGFTuhCa2ojDVE6D+7ShiIbRU2gG/pIHkeJvVigwgatW0EJa16j4/XQ/Nbpua6/eenPuk4YRU9Lb0OBLOEUoRS94zqk6Y2tsAMtDDLj4jpngXM4ymyRH+GuJHKsIqCM/kVLvuC1OTdB7VA1iexP9JthenzKhI0MaUAasKaFmsm8ScjCMpigC2ef14IVuFeDxfzQh+e7OvOczR9NcFCTxbtK+n9wurtEI6UX4abpy0HRsTcaZWQIeZk9nYQJ6XrRN5uN45VCeJ7M+7LiXJ1kNzTRDFAFC83LZctMcwAOGnTB0mJ+pcuwZsdlWlxOqRpUJ+6PnYE1YWyIbYM4Z5nnrU0XnhnGOqbA1IFvJanXwn28+7D5yQvx5ZxRinZoqKUsPizatgFtWgFnqdWl2G77LWy3hX2VXGitQA5NjRxnl04PuDLLVFAlAC2FOCZHnBe4xB0fH25CrIJxejz2NVBX+1W8gk+vXI7vR3rUkGNrjmNpFmqtdp8dvOdMy7V6VqeO0DfCsjFWb7eOuE1GRkn0UrZ0aF2hq7g5vto+8enqCHuYumqZEl+aejr0IghMnbg0hWOXPv39L7N4OBwCznmriqT+J5LhDQhXdZ7+m0cnO8LS3iQAK0xdkTgJsbOUxfHxDSPz3OR679vWRpV79zqmjuHEd7OSNgiL44Qlj1c681avKN2Lddoc6rR74SCNF2MbvOj0vEEArzZJ80en0oYbL0qvm+LS9niNy40Y4cNjQEOWrGIIkyMA8fwyFHOYyBAbOcKzqHUdDVcBiI/UqzCNOzeFPdZI07IiIFaxIoG2JWkMqlFnZE8er8MxgVS0lY/bSse77msv842d3myXG6lSlmi8hAOX0rupaGxWbdg+YaS3S4UruZLFGR4ovWPkrhwBSIM6+yDVRhQKsHbT/vnWeJ5bjptmZtZkaOGe90xmsnYGhzr7TlmqqGdBUaYpptCSaSwTHC9Af3HisynrDHgboDU5fkTP3lTJmSrcVxhFpor+RP9zTvSUEVF+pu82G8kKwammSfdDX+72sYkfScmFGx1o3O+wyPOWxfcvhTPDiGXVdAlWKRlFVZRkOUknj1TBW0Os7V5HcZofjPsd1I51/Ib7uVIJ4PE+zIIX5eW70k/uoVczyTZayn2is7ACkrJiJccu99u+315xubHvEgjruAOM2k470lCky+QAQUkOnqDNWAXHN5EW7EvH4zjN8xnUCN3fh/u38mUY96+5I8lVOjVgkcjwlEmfvDPvdc6i0bFRZNTk3JUHli9N166J2wAZplOpgwkQAFCA3Xy6UyYm9izsOBb3EAdrHcE5UmlSVTR1xWEKIMWjXCprfw/ypUgAjuIoXFwMmK6JKbuNk312/jcz45dIVI5Wd+wBvHigN5VFu9xqW0IEKPAC8i33pao/NMBLm/PRB/8ZERIRCj+sGbdA6ZgwKIA4LOAq31utwdwXEIc4EAeAACgZ1qxLOXFCwUAbpmAK9FZKgNz1up48hT6AJmxWN01ELm0M0TBgeXAgAL2xlqQXKef77y98fbfjzM2BnAl+CWCVOI739XXoWE8EKJxzrgDIHOAAPwLICgEL8yDEbqGfD/pmqzPV5bySskGvTfvEfax1iACa+Xu6MKVarW2JtECpcJHkNiFXlASbmYALjROSR0t4OT/u02+rMwAJsCarczOXGaD1ttHF7FL0totMK4zJcxonjU0Hl+WaVUMyfdOj/hLWd0kbMYEp9eV2ccvQjPe7IrtIO5JlERSCJQVBEpfopqW3RtXfXwzEDXKNnLuOo9rqKWLrBi5c47mLvWH9Fy3oOCD37k1V+JRa70Sfv5P4CyflUk8MRnmug7ErQoA4ljBGdoWeLRQm6LdQ2iaY9ESULKy50ieVoCUI+JATqtgK6XFrZACHnyOQNowcCgPFgBr85B7FeBUfX3kEr7i1nd200gFoqQKcop8wrVNn8z47st6a3q7oRcayj0BvBU2trHfLNiVkBaXbSrA1zzcaBiir3zxVlflQN5ygK0ApAvuPd1LBiQgiB8quDg3oKDS+IW3SXGRs8W4rdCN7QhInw8EgMM7DxUjGpcSt4WAgggV7j58weavK29OutkyHsQ8T53ACgtA8LJUWjUKNeHINhMGK2G+mQicC8A3aDbs6mjCKjNVWAuSYcNpLR6sf7ccodETXmywjLceEGAIxIQ5xKIgDwGAu8cAD7UYYJZdxDCVN3S2Tgs4TsoV1NAxYU6RbEyZ46fk7L1y6rw0+f9Rr9WZGuGmChgLgmEIca1NlFf2xqjgVps6ziw4oWVwWXoBcskK0tacjA7adzvs9OEzQRDOiMTWhEpFw1/OeNo4tM6NdkjQl2Uzi0D+64qQeh0mXLVV2EcIqWBlCkk5Jp4aeHUL9IXSwAOjqjPfg3kpyfiLO6wfeRTGzEj0YBhp4FFbJWRme0t/YTYUtoMJiZuxSJpuwe08tnWhaTr6dbfNivIo3TyLyQpGSWMDdSM0AN+USTT0qY4IJOQvFyqshoihH3VWVrKp860bu3ML8EHZADTIP+MwPgrHPcHtX/Pgl2l9tGUzXhJgxxeBWVdzBCq+XPOewk7XBUsWBD52SKD09+LY0CO3EdFo9OY8Kuu01UiUFT+FIC5/4ovXM7opVHe/4GMbxPhUkjtI5TgysSTXxHPJ+nO5X8ZWa8fCGEXRluYhKRBTTPc/FXaZ99+3XmjE2RJ6bhlITDKDsrvlMrOXapWu3C1pLYTM7VzijVXO16+kBE4Vq2a45EUgSSt9uM824dH0COokNSnIxprcqUZRyKkUZUkgcBEibFSlw+OltV5QCQcS6LHnZbHc3O1v3vO6otEXOnpDGPXGwaLETdtnU6H0ifPAJaW+zkz57ov8ac1McwClGa51zpr3ToH9qpYiiE0DZ0oMOLm0k75weO9A7PjHmWhGHOCcAgzjEBKzhCzCXtbPsMC2xS0IocxPWJX3nMBwWoIIKBxTX/by3ndwfiUzWivwQsirDoFGvljxv9UGvvzz7NX3RteVzKsCJOOmNC2I5No6qVDF6U3rs9uA0zgAvAIIFBstIowEgA+I8ZhCU3IkyH3FwvfAVWbvTe0L/mgVt97iCczN9touxXSpzMJZbM4l0cmZk5/R0LF+TjBkRB1yXaOgjDf1PyO5VcNv5ugtO1ojjmUa3npgY+yQ/2b7G2FqAkScaisZx8CxoTy/YY9eTnnKxwRv0DaCIdJYPFHZueKJsKlG0vPQwKondiIIyhyQuNcDU20NriENb3X5usTgLg+9Yh01fuIELNzk/lE1NewVAMcD752b/4fpHz68vZ0Wn8fgATw1vdDRWiDe6o8vhQLrK0t2WfhtKKcOe5hb6LRT20x7plfBGOIGVUIwPC0cPp6+bKnvl9g69mGyEi0vG0Br5A4a48SLq/n5+UKvuF3qVPv5cxDTX6Lgo2txI3W2B9zxnO3UiVJZyRmSwIAoP+1YuM4msfn9Y9spsNJKsgAKg+I+HtPXBFdgChUoBVEom/cgYrK4iUhQI036/Ary2wuouOdfTSCtAItdgMEjAIANhaEESayNehBLWxKnwHSONCuWYTh2WsjgM4u/K3DacfslTY3w0QITjCEaC0xlOFjV1I79LruUaKovhQ+YIuz+xeAqYlRf4qkqsQRVoL/Om21MU4FTLfn+bkrOwYI5kEjWuVzSyy66r+qE1IKQInmIAgZgAMNdZUwhlDQxtE0uOowF8aVVAioAVj4c49kAfCpioxKXnvcmoDtt4PDlWVAp1NDRQSRr1LFYNtq6vW1+/3rakGjJBHfTBg8jU0XO4ODiJVYsh3H67tePQ8shoBJQI4MhLGUiOBZS5Cx0DtaQt47DY/coe+ZTs+r7v47zXQLqbp188Nizsfkz+QMsplKo5voVRwn6KaGsyPZjKTErughMNnZP0GmJ1D7zQ1R9wuKbvnYDSUCUnIMqnYneuN930zgVr8FK6xCa4AQ25piJI8/kO4tU60e2BSHw3F9kyLbad3qk9xb5cdgYDvRQEtGgNLw6s0MmdElfdUa9lK24d4IL12D6gTQzGABbkDNwX/oVatx/u4Kdn8KIOV0steI8DxkAsQjxOPFibPRPtJ1d829O6Bfa0e48TEee4KQqvKkvJ4TBA6B7uBqAFUMI4hRrQiq3iQ/L8kJYf0dHLbq7nNhTHktIba+nkWZ00255r9zTb8iXODcnD1JoZ2jXpFwyirJysxC2iM0dF/vDvsuHqdz+9VprdmKCExArghACZEwG8Ip5Ftjouph0uBnvz9MOwAi2e3dkrLE4Tmg6BuOW8c9L204FLIjwcbxyfN2//dPLupwXRDV0R2GXJShhC5cC1XRTxiShFEcdanH49ieBQyjk3rBtJ4NZtDuwZiqCh139xlJcnr4DsYfIt9IK4/Jm1TrTl+LO9ERlq5EMMQVILCENfhJQwGKhr6m3H4lAmhsbUmIcZZgL0Zqt6Y2k5WlzFklUBWCvsXJnnl6adTfo1j4x9vlrth0bU/JIf/tykB/N1WkpWIA3ieiJTBFABgmnZlPhi7ClcQenAAeQsLnFSkgPeAXJHnhdSXnD6+JD7UEcGrYJ1RY4tu8dJFx7mpkuFmstNJ1dUs+YM/4wWF4QpdC67cgFifkaLLJjlIBhOjsFzS4CsPyC1Xzjc1y5SBzEijBkupG8BPSuiWihkDDQ2TjyDNtkuKElH04fhnPaB05dlMSCIzZabky1HB5yoKpGIBEpTuWQjiAnFCGlmhVjipKMaRPjZmm1hwB1btbOfSS9WQSUAFgtsRO9Yr965fnJq3j62vRclii/8Sheclb/fpoHcEadHQ6yD7OJ2tsyHLdse1HDoP6ZnapGKMRo6em7FhritNxZZTY7m48EbkcqaDLW0KDLggByqduIHRj6Y7WEj032H6yP6JcXxli+b7deKWque+9z1eS//9IK7Fk3/1kfQOVeMe1q2Qme82wRamRurHKX4kvaVBXT9HNMarD770bEgV7YrLcRgqw7l6HBPVBbFgKmK2luKoxztTTuMQ5wmF8PhcMBgPHDFJa6AWBLCoqqyhpNV7x2uAKeFcW+5NTh5+kVt5nTvty7TAhghS4mDtiImAsMxsuZEobhwT+AqJE+0oF15NTuzy79Ds9eJDl6BCHDSsNVc7XWGaOboBPvUw/YaqAWiQekKb/ImH9CWcfOVwZiRGGIIxCVtqVaUwmmreLyBdacPrdEayjTQOjWAMgUFh3tSrZ2mvbksBtJyCSANkF/w6m77xkVnSshz7zta2m/AeLggq5PTK3+VmzVhkBFY9VbIegIyhSI/mijVxHTqO6pbUsI0cwI473C4Jjg/IkfAW0p83DVEIRQ26+yX62H37rSUK7GFW8CnXPi0YWbZMNb7LT+WKKwbslITywwW9SFXTW5UIjYBoQP0Bp1/2UxH91wc177+gucacHIsXv4OU74PeE2YQtJqMg30Lgk68ppUCLpkThOLxVNKEqXwIJWas/vBa0iY0F4EhDA3n40M3UQHUF2jDZSmv2oWQLNLUODqeNVv9Xp3nQCbi3GjcRkyTUgjoV+58Y2rpWVWtXfWfUd/1pEqICrRAZ87dGAj/N++lL6+Sy5iA093OpSsSG4DCelaII2KeDpJ7JYPAxMT9Nt+O1t6rnsVwIpvvw1cEVqgAlzPTV267+mJtpLLoZt2oqYw8IhVOTRB1TAWkfsaMGhefqDO/7KHdvorD3FuwxQLWVoRKNqJk9PzXdqeb3vca/uu4WorIbIisTsBlXH1W0coH+qQNcXvuxOXSURcg9OgbHfz7au5rTvz7Dzez7szmSUlDEHRno/7usynm3xflX7Vs8TlqoFtXIy0cNMdZXCu18ARzt8qUxGqxJvuPZr0mzi3aL8mFIyHVr5jApPrW095poZxAFKaDg8fruCGroUijYTNDazRuqk1bFARaaq+YVanXfekuuOS4wooPD0W9rsmrkecpAMAExpgXTI6EjfCytn931Ru4WXYnTf1koawqWe76+1qI0A3W/h0z0CZcR+2A1XgQwZ+Mu/xOvbVuB2VqmXPbPSPYT6gSs21db3pjGgY/85nKocbuX0aSRIzCKscg2M9Y1qgJDI3y+VfPb/ZJQRgGgYmpuEjYGKiNWeX85b1Dv4FUzedqlByR7wrh/cdq657+DNvLlhuuoEOG6LKNDJWUAojKNEmIvhaD73v5oLj81yM62R939GjtcbjKSJOEb14Vdw0WGWtF/Ve6DZKYgEYXTPSAEe5yI+uwQsWAEIpq+9PFQY0mh9sj3gsth1rc/RaEBMRJf5eDV3udvnYNHVl2ioXva+VcMIUygvWkWT5ojLrECEYbBtT00zp0Mz33wMHh+L3LesQOGnA8bEZXvpdcf6OpKxnBaECeowG+iGVhCbhQhdNLlvT21mWDgG+0QP2nXR/0KmsRFEFQ/TQXPR+tbn7ATA0ikGACLsyM23kqqDjCGOwCM3RApLfub7pX78wyeJp7Y5NSCRHwAaU2y31thtNWq8qcVUuQBFhJnz1TlB7kfzyZPpIoTunBU9fTY6CT0q3f58zDSFBUpIWTbGe+cB2Kx9nBVGsCkZo62TaTywWQYl+7BORJE1fF8ZHNdQW4RjyA80x0OWDmrRduG8+3o/jIzrxqnW/IBU3EH6pXk++lC924+XDf9f6gudMNxvx5jJcq7JUM7TH61yqlK9zRVKt6GCsXLGLsgQyKAuqpmy3X4nAuuP8yWajsmVbtnA+b+AwvXI1EhKw5tG9OlWCJQ3Il+OYWGc607R+4jiCo1jkiukx95xf1xEWv/3ruGCcjqOvm6arMASGcNsbtZ30PE4rHvN6jrynpBOn5pld707cNq4d2qyx7MdigAqJE4cDwQHevf3br3jdxOV1KutPu/pM5d5ueJf2PZRv02Eq59+jXv4BPBQ4qFRZFxAFmPY+W7z02/6TaliLyPlTsbDWLli9XHhy1Eej1i6tMpX/VGtDZSp8k+unFUdX3l9UmODi2LakQ6frmzfd+oOe3g0YJibavdaMYhG04p2mpf/zxvE1l17vzjgUMRU4Qdwde8Bd+Mz88Fdqx0qbG+2mVF5paVIZtDdpgHjHqXi3/6bfm25U4iepvzMSU0SQY0j3R7Wikyr9hvXJNGPWrfRE4UHO4iuchZRXZh4kzxEK77yIiyno9apGUxceHQ+/t9eZg1ZQaEdcn7mcfiE2TYZq51tubFo3RdzxLXwjl0t1q1vIlRB2DNWYKdCa0spc8uQIpDOAtg7tvDlXa63vOJTUE5ByG+G0atOjZhClN8s+Rthc08gIXqFZMc/tOzzpI7zYvNB59Ukyid1E7HLs1XEyug480zKQfKEqVOENUrNR5qWGjYkqvF+HJ1/erY7dPIdsQKIWVU1qhiKM+ZYhvglrHTLaTppsf6E3+mopeeDwNN2k3WbtNqr9dq/066gghGADKVghJZbxoangIQmDISBwBu0IqQBn2yCQbZrvTiyWKeLAgsJdfpQ4nfKWMTElDiO/XSunBgxaiHpwnu8X48EdvdKgLmz4RY5MdlFkv1Z83j7yj7UP+473n6qPtoa3iBpcPbjTCpHi5sc8RpnjUq4Zt95mpISqsjZtaLfbbdb98RtpOys1ZvxJPdTxac3zPUoIBFyLUDPgLCaFfGknVdtryykByKVnFCZ0p5sEjhapY30yGHimbiquN7ZGhI9oqXTDaqxa7ck6zMjjgamrqqq6c0jrqJUofJQmSo6sy1nTCri1/qaJadP4OPnS49Tt13Boo9AoBhzOgtSGBssa4cDBmP30P4wK5V1d60j/D23+sfFUTaZp28EEsBad7EehrPN8va6y2GnPr73+yRtTpV0/QVYhC18PgY3GxlVf2z/kuemM9317/gnMVNNaRC5bb6qUrbDGsZ4o7GS10fjJX9jH/3zvcI2sxtDzw3rz9v1Hw7789D0f+Cte/La+lh07hQmGiXaplRV4gDFkYiptGqstCxnhGpxOlyud0FKruqlCppRiRWcC/Stqzf4BD3/+0MX11JkvDOuTMg17lRPJF9Lv/b8fNvR/tEEXHa0KR8ZyrRVCUMGg5DWlWBtbp033Y1+rqNqe7e1Ucb9QlpJcgCwbCfgRJU0LD670xGHVWFdp1PHl2Yf8yBdaja2uXhUR6u6wTzv/uHneZkx39Jsbkwh9M1k3dzQEzbJRZZ6NsiHCFFDyz+xS9QszvXQCSvp6fPyLm44cnqsO5qo+gAIIZGOnpncJ/WuwQAQ30cLY++JUN9tiF5OqJ33RvLhT9nwnFRCIX4N3J9s2UMAbCLgJg+RrrSqiAWWHFxKRURUgIqJVzhss8cSHQdrZu6Gjk+dCV+E6rkdReeHorHWi+0nN8qGvc+WT1mIf4k5xmMWd9Cgtmse+GgKCgshGhA2qgMcrJpYWNwWBcDQ+mr4B6eHCgSvFr/ZuMAld4qJme6jOD6q2h1d65YHPaRRBKdhFEUV84HtfdPORvOsPn8JP8N1cpVprMgRZGgVW16wAaFuKjNB5S2sA/ZFriyPzTqc6KRjvRi2KwPbbW9QYAQGpxK+S+UHbEwI1/Nj9zu3tuUlStMm8LwCZOukpcdrOIMPHJpiy2C+vhUxYPJ22pBAfGTAYOMl5gxjT2p08cbnHjadfTIQjMkprudCQEC+y5sS1vHMITfNeecwqXs+ZpIHqoMpE08KyFskomimKO8ft+aCbBagI96xF0nlvhJrwFu/rf9ze7dbT7NyY61akbX6Yf6zGZv2L+pNGk5d1O25dtOW6Vmrp4m6jdlorrLXwMthqP/Azz33zz//cv2b3BXPBnInF6jFmXaOELFdRs9O5Zc/511RXqxMEJ6lnscDUxyJabQY97P/8pQc+0DfvOW1q93ppKnT0ylShnk3/+F7hy4dH/MWP7sK5FvHGGvkqjpmEo4Vz4nph4OJg0Ux729DbZiZWXVUZQlYCIh5P6SxwTQad1so4p2lOXyO2rfnBT6zbDjfvhMPDecY933Kane/1nmpuxuEXKkt3QhHJOUgKCdYtll+7aGncAgDlDlf6AAcrjdML8KCrS7m3nuD0jD65BfJbsMxhSoRRaZUhDaZiJ9fW4S7ZbcZz0ICiAAVp0jobsG/1+eQ1sBywiZTUOHxo67OR1YZDnisNvwGOMOYSsqSRUcZ5kGsC5lk32oMVlRl83BUagY7MVNjY5WwnroCpiDXDun/yrLCZmBFxGg2wMIMOTdNUOl0QGDOsPKswCe2llCoCBmChiO4XOEAQBJzEwR0+Ci0Wi/d5UVMsBM/y5UE+PYJ8SNHDkuekyrI8fvzxS4i4azaPtw/3Hn/4t3/6FHyo321uKiLsFQpPXINuImuOXpmt9e9ksYzQ0JWOw5O0tZEACBc9IqgqBSuFw3mVRYFlCUdAC0WeOcBNL48sd6RLRyfJk3BcBOdEwEFLO5lMET55VcXVTAsKmBbHJ5OqQhDwBBm3nTApir7zd26c9MlXPM/uqFKs67YJCA5whEzyrJgAwuIfoZWmTuQMdAMoZdt5mRp9T1FV+ENbgCO6CoY8K233qie6UgoewQZ0GQtn4wFfus0jZ8RQDCQCnhADBR5CPCg0TaPcKoNz+1//s9/5l7f+6/Wzj7pfKUI5dkyLBMkagJQURpibyVPOXZe7+3BCUyfgXMcFoapt6T3/0t/afPWfn3ZxLtSbcpuJ+Vn7ooj5jEcc0QO+Xg/5s89Ol2qsWs4TX3j2EDyIc10PJN36xLphAd9iGzWIfQECoHAJuUZFk1WHY6RxmZMXFLjsvMV88Hei1nS/PiziSDTzhzMu9Ykz08/XpFab2kg13Yk7llSyNUyV3TT5EjKpWHPCFDDVWmY/lTx6nz49BX1bl9byYoK0UJ29IW3+i4oeAiaWml4tBkm9vgAVjGFzlPFqPKxA4BuEsaPrqfRi+cxrxWvK4yVsP3LLZTOyFicnCiKJtKU1ALmtyTgCjIwKoikAZjqaD97Jasjzf9Mts+2+aWT8bqPSPDg36Xj8LLFZsYGmpYMRHOnCvldksMKqLzw44ti1Oa7RcdAiUA3xgGplRRWUhYqy2AnAFAEnjsNRwKcsj0WUopWDgTXxorg8Ik8PY31k4YOlh9a4AMWooEqwiz25xpTp+S7Jj/C7Dh/F3ZeP8B1zPaDo+y28TqzUbidZHAQ/lZFMXAUcAZzPyODxtlSTq6JCHX+gLKlYQjYN6V1m8dFuTzluBq7Wlh/vi3si06kVvAU5U5G264EIsf8gNkRPo4DcvNcaaRdaRkyVtTJwAE5IEgtomeCkDGPJfSgGa9Xc9Dw3/3jGVdXAA2fTpoSC4JzrOTcRECaFF5omumqPFUXETzbCvp7M1aIBPe1WCyBAPf7mb2LG6MMfqmZn0nUtoOYF4Orlt1ZvcPmHEINqTJdCIVkhvgC8xb5gsTxuPv0PviXVOdX/vlY7/4FtFeI9c3NiSY0KOtIvDqzOTcXJFz1t2JM7j+xbcefIkbBIYCoS3/S6k7K4bnZlfpn/+9rseTj9msvOPPzXnxKhbevTg55aH/FNn/P11ycTM6SR7hCvEvEEB+J6rDL2iPQa1Im7tHGyzYxMFijldU5EFMBlpfjSl0XRpCAyXzMrBQqNxlrqaeJAQ37Yi6ezHtsXbybDXkOct+6677Jl97RpcnfURBvM1vqdvpmcPMDQbLie9CxIroCURBqMqvSE7r8l+cJ3wewEzNu6BJB9XK9Ne+1IOLxJ5eXSdoLYjevntH4uJICQ0d6M3ojeB+0gZjFVXNroJXYrd510olU5+Y5X7PdnDxKMLRNWAoEvl70bO6ALaaIZYEpNMGR0sQAlBNoDeoMTe3HyuGbbWlNiJdAfH8HXrHqZZg1jXzk9YLOmU4+F6WErpIMKCd7TYxeHUKAysHDat8G0bwgg00U9ZEovH8gdmSStZ64G+jXk8+Xz4vTw/PgI3Z9Z/CD08BrbHOJKxvFSIj2l6e7n+l29fXwk7z1/ZHfynvPTgjm1tON9g7UsI2JpxZ1OH6FkUMFa6wpGizO2WJGa6wQoR85nYd8414FNgAKswur7X6V96ajH1DGQEX6F467IypxOoSyNhBiPu9RZqXT0wYL22yerEMD1tGWN/nAIFKuHPeGYiGtnEOeF9GZ788ax031uuUScIuXxlelUI+TIrVMAgXK8CuAAblIyi8s3v0YYfgxsf/9bsIeJJe8fPybABctVT3XOe31pUexgipD2KC5f02H6R3LnvDAQml4HCRDgM53hs1Jd3eHc/1BdH6/I769fLhPKJDkCoZTelul5856ne78Fr/wXu0KQO9JFjilegJJWEN3vr/RXX9z/CW3edtOIcf4iH/ZQvMoXz9ufup3dujqB8TQVMMHYF7HHi/RWxz0XZC3Hyd6obGdch80Liypbubr35pv7/T4y8r705dR7cMOhloZaHI1WKPLjndWeRgcO7OjzYfeNhcXwk6JykbHDvtfVpxO3tfpUuymsPZJqUSc0KLr6EH/67tl09SZbEqmEZhfAeWWm2V0znd0D+7Oddcm/UPzfBGcXLo6PNNKaThpULS3QD2tgOXyOnIXR3N8OWSsaRXtpGxWd3S5Oi88y7U4nWV322zX7QB/q5qMHffDJ5xqI71ehcatzByi10JoUYAww0hhKX1nXXrffAJTKqs208t7bvaHbdLAsaMLRGWtj02qIQmEthEE8IXixgk+AHlOpwC8asrRymXuQCUEVWSTOCYWsRkLfmm8cPzMn9jVFHe2sxpnNw0P89hHl+PD2+UGD53NrNhSrBTCOaS4iGm3oTe/0bf7I3v/po3p3vsgFPaJZ9dZIyqnGZCS+jKCzFP2+eMmpxjIupzTNEggYTr6B3BH0as9CQVGALBu1WuM9gFCIlMhgyGCNvfjC32wdAHEVJgN6AyP28KIRMFkTEVLbmC4WsLgSSCAWkJIBYUBEDerVvKEXp1922DhfVl6WnuCoeg6oEPoa4ARHXoyLZRU0ZnUFeqyGqZcR/Fu0d6xLm5oApLyRD8ae9hN1FAQVlZrkgNOyCeMAeuAQ4ilYACHg359h+sycf7g6I6YoAlPLAPDSECCMIvFrfMLM+Ywb3+0E1j6uQ9fKIHcAguQIoINg4FPn33z54G9PD3ni+vxXEK0uJ2g/S10q60dz4nQCZBr5sfeaQNby0LGKyNq4S6dcgc3blw9uARQO6OMKCwERgT4MQfoFiGikCZTUGl10oj34S7NiNoRWO8604Vio8l43e+N2mUpaYTG2QCnZcbNJU5mRSOd6CstsmmAdgixoASlE19CzGVicAjS+Pl+brwHz2rT7x3B3oko10HKPXU26LwPr1CfDLvMXH8q2przBETHNFM5U/rmX2jQ6k06JCWzCFFCBgOw3D7ZONLYY9ohIR4F12XGJJgSQBkKqkbYGqOrmtLk6fXZdV2FxDvzAgpseO2PWYQR6TxhUnWWax160NPQWKgQgi6iAIewn9tNFRDYgwvKCA0Ls3JPT3OdGEYUvKtsD88ND63ePjOdHlO3hw+M2+dr97LoI1Krp+a5ePqL3PH8U7zl8BDdHvWLk9pyrJzdTOMd1Gi9P4kKcc0MW+8wh7RIRER+AshOAEAilE1UV9hMMKnSl3nZFgcMXi0rnBLAmHBn1XNKRAk8qgIA71lGhaYqkwaGCiRTQKZQoiWstggpfgPTajoJBnERZg4FW2zy/q+98Pu0aR4nIYHE1FHHAyPnQSZcBAjEhp3k4EoZth9tV1xv7ieWN8qGhqOAsVAAFrDKSA94XLBYnDgQmTvCwMsaL1PzKfK8/Nk4cCICBxQOtIrEvdatvmZ1O3PdW93LDejTAsCYVgaY9Bwh5AejAatvAGWSQYXj2a9kIOuSIU1AC9BARYC02EVcVDeEuVx7+WfVJG0kjBIaAQ8hBSgsAhloCR+kLizRCNLFqcZR+0MOnc16aj40lGUaOBemeN7499cJ54/jOBBJlxHfsy+bkx2zIzCSTLL9sCisRdqI1Bxdg2TLPTsELC1+nV2BjjrXfLNsvwX/ANsssWoUWuCrOzSo/CBt487AmdX3LQi5EktpOCtPbP7nomkhJWksLB7+5+Qns1V3KDRNu8h2As7aV5dFA2624gQ/PGl8XG+ItXual02f9j378Xh549aPlVhCPnzy3+K5zesG4q2t6Ak90RyqCBXGAayMhldFkuRxlLK76NO9TwU1LVPSbTJ30HFMRASfNiAlxsLBvKDQyNCXqwu2lzuofHqSHc2I7U7hfczo7yko6Wa4MvQW7sh+n1U6bmz/S78eH/dbjx/iu65MndhHNWkoRyZaBdV21uzUPrzuteT7XyVxYLKONgNIaiNNJf5GmwAIRYWmhIo5FlNKiEp2AUQZMM0sc642QVe5YkbiayIpEARg76TlXGFF5ZAQgtqINrQocXTmcjomyIBTjFmkiEqa3lNkg7+fBe2I2Tuxrow/3vHGdJ45Y0maNgUkfa0MZi0iaSMLigE6oxNGYHmkRH31/sZAetvLqmoiTOOWGNGkSl8KI3FKuLU/34MUJi8WBQ0ljjeH6Bdv5wX3jnlL4FKGvJrQmGHj5xjHV6h8ByiXab9UT2TPOM9PFznp71IEX579688R2DQZt7ZFhJeIEEWw4hJDLke+MNcQmuHUM8f7B4f5yVkBRxMoESEMO5QKpqrr31ee7XHJtRvreIAB9LTECj3h2tdzaUTKGvQBLjYJUlXhtH7x+0piWEyZIHUMuat6zhg2O6dQkWzJvknuWZF5l/9fmtJnSoOzJfBQt4CFuAcW2K/WrVteXwWFRrxw3Drj0gNn4xlR/o+YtJIKoMIDJnVZjW2mVP9c1ZwVyIZbYoBnNycrD/d53nrlqu+r7ZuS66Xv+SZ8Wt5FR2F+G+EYT2tO6OEUBpF1j1lCiLQPdyGDjvGD5+Jn9X19/HF/80a/McQSyQHqf0Lv21YtwPatus24K/2JvXQ4RRQSnE5GoHd2Wv8Vbw+9tAlRN6ANVvwL6LK7ACTjBCbsYk+R9cRikBWPU4L6FojN9OpPjeVrP7o5XGRweOjxvNyLYUxRAwS72xvGW6et39R6/0xsPn8rve/m825dG4q/fjaJK9mcRiNJdJXDTraq9c4iYJyAo4JbFnIUFgQJgap04kel0F6zNEBXYYxPsG46veoPEUzpAKMZu5c7cmKkilnNrD7mzSAMg7C8nb0hIUxWK5UaF9kaUg8M6qa1kOMxJNegCUWDSc/F+RfYKa0R2NRxyY/+om2tNJ0y1Uy9a690x059pXrk7Y50iCntJbzAJUpaBYW6Dqi7riqg0kKSHi/lm9Ppv8oavaxokpYKjUZom3HZD2kThzElZZJqwZtG7sYGH10ZZVV40KTrLt5AONFglAWW2kxrwYSUIimjb3BnLpFR9VGftWOZKuYQgVfPWzDoMUPKaKYy8bp7s7/uznM1el1Rp42w4rABB4mTNpLQlIfik8AqbYqSicDeZJpJBOnCQLr8ui50yoqYo7pinnXHrH+55C+Z24IbLWEYjTDQsIPNcg6f0vmxizIndK0gJSTRzfB97iSwra9aH7NztnZkJRNXyOZ3nD6jbKANw0IkMQlKA/Eu4l0t4K9IzSQYRz06GBiGUlmAMsL8AdURu+2Cubr312LAonNhrMzwMmG9HogAqCGLJ8W7K34OOAEG5bRq8CGqxUyQRBAGDk2kudyAKUlHiU5PIYE9iPd70NWIBSECAPGegBAsGhIuhcJa126PubVhBJ7qpNic12Bjef+Y/9eZj//xXF56CTTia+ucC74rrF/H1bLSJBHa3pSO46x5Hr6dkBy0oqZZoWlHxaHTAEWAi4JocyQu8QV6H7pyJab7ls8rxIcOn8/JyblzOrLZHDLYzEwtG0lUJcVzM3vEPdu9L+OF/N1/ymstHedur512YdcDS9t9g7agBSjXZp4TEabv4TMfHTtIEYETyeMtckixI8SFe1NMossW5Xm8XoBocvopS4Om6gYqy4A1jX9AbuGcqj2mv5xJFrOVQDWkNAFHKY04iVyP8OJVIEnCXTnsZsMeGrUqoIAkI3JY4xzN60/d/O1ANIN5/2Vxv2rDw/Wl7fO4rcU0EFIKhXIpF4xuJrVElK8skwmKXaENYd8TFc4zGnjHH0sclZNImSVa4IR7kiyjFtb1YUlsas1iIH4crgOVUm8tJXHC6B5SxZfLCETgKoFCmUVW1o3iihHKhYTpxwmvk82N/oWj0+4c/fbv98FxD3pgpAQFvQZogIfOxv/3wqg0g48MfBrf/aFT8OEu5ni/So0fTJIUkhnHvz6W65+e55+2pl/d6p66L8GoS96kKAxhdg4fSYHeLOGAqWcZq9hZNUVrsZV7uSWXQy4M3yRRzCkydJIV6ltGOGvoZR0+cp0h9g3S9IOlsFrQV6R50ACU7d4pyGn4J2iwM20ec79bgNXXL96efcfluqQ9p398DrAKICLxm43nID112NhjihfR4l1qDMjMlwX6udxuXJ+cNYFWpdWshU4qbZ+k9f9UHc8qvALJsKrvmKJ0rYx/SA5XXUAu5zfxcfu3us//nP33oob1q0FninuBdcfeiXM0qWjYxYYqkOOEmocQ5+rwaOkCaOUDcEUpfuZjg4IiQ++N1q45UpZ3yQ3l+eP18HqfzYj3TeabH2WAeHGHxLgmw/9hddk8f/gfqndw6Pvzrl5fYd1WvpMKRFNk4lHirxcXuMl2DiGMoCzMkxzQtgKJvhRSYDlqu6jm3S5AEKKftIsH1BRCNLCg1WrWUdRrR2giLhyx2eJf9phciSXpMQTTRZw9Y0BEgDsR4SIKXSW93ZsXOGhShH1EGWtzZMD5v2H4+5aZ6hT+d5nCdaPU1cNMCWixZxL5J0fqgUDjrYtQdanRzDwuOEiz0OAYRCDEM+kB8IBOH06gsXWKBFquJj6EAiPsJMc4JgCite5YUAGXdWap7Fe3Xhea0zEC7955UF9dG8sQd/f18emfq+NDafNLaOIzBe/YE8IxJRTramkiagMSHEZkKCUBMcFANGnin47m/67vnu12zO7rppEYKJjlAXuLw4DILRkBeaCkx7UkSoEoiYaNtEGKDMifD6HRiTXBPHMePtmbzyjrrqQOFi9nNygqmoacfok2iF6ER7MDcmTyBTwiVAxKbyPQh+vY5xl1UypNusn5hp9zWcuwj7TVD1pxQgcbcrZXye+PeAxZQU+Fd0//8YDdABmhkiHKHXr8ZIeULFYu1ECDi3p/B82fptEJ2S34ROHbZQZZ5bWTeS4ecnmZ778+un+1P/YVXeuraGs4BVWtyEnhncfeCut5I6MxSlIAgTpgKdMMUcPLq5kjVp8Qtlz52HvFio9VTumiH6pxqPat+elSezmE9u8oLwVnD7QKwAEqOcLFFXE/R7jqHD+/9/nDeo3dz7e759u43dvrggJUbtrcgzigoyCBzXBFleQVh6RTAtfowvliLMyBYIZLTULZigpMibg2HGjHIFzV1yhwSm3A05EJT42ABTkRupSDExqAQRwAYQkhKRBBCUZD0GeCkVsWmsXGXaz8usG6mA/1bocfSRasAWNt9YJCAFAynpHnbEQofg/MFASAGlxWIBwokUg2zXICE5oMAbqoFWrhsBaT7964BBHPahwYw1EkDyddXTUU9fXrYizj/xX2dRnajgAA+sCgIizuhjKE1BgEIgMO1BDccRYrZ7R9f4qMfTr14MS2/GSHWElB68ABeZOSR4EcUgFGMJNI2YYgQYzYMhY9vCrOwBRPHokro2Z9tKQvr8Kbmt8AI2KTVpB6k2plpEidSm5hFXCxiEEIBVaxdwZnGlCHWHOctX7/xZMHqsM2Vn7vNfsJ2TAAxbLFVMAcu5BycE3Igj9SzJrs7oKc4DMgJbLN+ebb5HSg5E3RX2kpNrqb+LmS0Eoy5Gnc8u+4onStLJ3EHGWPgz/uBR8dn7y9/+O6+8coO+SEdgAuzwrvy/kWb5QR7pVc6nMix/cQ3dQOpHBKNHI9+J1OQJVo41yvBAleDlEYc9hgYtbAQdaH8iDyclYezWuuZzekRuZ4t7DQ/UKkCh7EE04vTE/afML1/F3cdP+r3+SO6/ea5d+9nQv1IFQFrX511cRarKGXGBZd2PUpFUJYUlNHQRYHYa6EPEDGJuLam9RCqXUg7tKe9UcwwnjLyAvCGh3o9oSAOUDXBCuDczk2qBjjAu0MqxifmIY7j9SMwrGiqEqaBJfe5S0cuKTQuCvJkBZfduGFs2rzrccs8o6XGACX3WDysAF+gRADHtM1hgHgMj4sKDl0K4bAQwLN46MFNrUtY7Jzfs5oD4ejhJaDAiWhjyWkJBbeqPWpV+yqnyg3mXHgCmG+nFDy519a6Cv5LTtvrl/tSqLWlbaQeeFZDCmmgGnufE7w1pvQAWlVBzzmP02gQWxli5yw4uC3jnf3Uh7vfqtoYtKI3zehDTlYAOEZuhEDGOinVGqYdsMO+0qI0/sinLWCoutl2GJsVKtMWPumZdzpPYCJT4e4eyoDdxAPbayeWTiytjEU0SYSAErQrTu1cw5Y9gdVqvTvr2Ao8OA/X9m72T2PE/b2A2DuhhLAcfLeW/CQoA4XcIj1nk0061U26yppMR9sOHRRDIXE3BMHk2NbYT19YCZJcASsS2PWCsj3Fe/H5pCqUSXvHYPucfvHl5+Hvf3zh6VBOmvq68c7U34FuTiAiGBnVeIpTKOvFpIQW3V4P5NUAHNCsZSWmruMQ8RrVkImwoUbkTnl7yQu9XVBfzivrWYPTWdU43ziv2c7HOwxrEVpBGVxsQRFupoN7nXv1jt4xfdhvfXxnl0/v8PLbeltlBCMcgWEojd2yYP/uob/EMZYS0WDhwzoCH/YIKFCLsnSIUWgKLh4MhkMuplih6w4Mi5YKWCOpXGHluBhMBdMKXZT4IFYlXMwwnR/6MI7LpVqNQrV2t3VFeNDaU4Zy3GIXgwiIeFfExPiiiKiJtjaP7zfM3N/zrfGAz6IYLlcatmKo2FU5NrXm8b1aUIWVc+IQZQwYFhAnqyyuhix2TnrPzAYDIO+NpGGMBte2rEGIgaEJDSugx6NdgQ4K96eBeoSqKS7Ics0BxipGQrxnNd+w/TTXa6/4LdWGk0YavOWE8TikiU/SCYgIOISmQwAR6Fkw6dMS98wI7N9Oe8e/8PPn+/injfO3tTZk6h2L/SgrAQFxGoEfuVWA1IP6wq56nLQDNrBZ7JPJmZrlaimIElXlAY2z5zfgBhwIJIHlkF4VDdAME7Vz+GjTErAQEgyigLyHqJ92GnaJD8s8TV/PV+CKA4DvdlH3j5Nw8ISYLJEHnMm762Ay2sPEIQ2uKJ0KpNIUQ+bcHPrUbLlJJJJ2sQ0wVB647Q6O7np0tpJ2iK0dx1jglsS1cRDnEpclfuWZ7/nx+Fx9/gcPfHE5xhIvXOGdNtenmW+vCZlenj5nOoVAN+0GkdZUIYfsQh/CahIDVb+iX+FiCxGPG8MRQ3kBn49q4v9gW1Vn6vKo+nKuTxeybfV2vi4XmRfQLsI7JKTPo1cQP9NpL3R5+4g+EC91y+XFL6wX2f1qQ3t/bYMqFIhgZIfdkz671xKx+FbKEkFII611TN7wCNkao4F7lg44kenULRpWTRxehGFi08p20yOh4w5kMe4NrTLChUhBuBjxs79nP1oniMcKOvnBG1mBXu+oaZy02EUV7pZl4t++3J0NNPmYrKgE6M90p81zp9NvOO7w2MySx0Agpnk1hOG415NsYEo/qhOT2Lk4PmwLHtcbAbiiYhel51zDMsZNQH+gKS2rVK3GASjxydNZshry6N1PsJ9wSu+oburmwz+1UVYxKwwMMA1T2zSAp4Yz9mhjVJnw6Rc/zW/EA59oX+7xauUK300DaWAXZXqsJyyt5F7hWNwfNDTvEF7iJ7998R//7qRzbk1Va9qaFlgDLTEu/MjRXCOgzFZLBEWRhJ1FCYSCVIXBvNlaNliNz5aCTud4Id5Z1wy/R3sskZHQzkPfMhUGaLpkdg84MM4GUpDkBIm+Bn1VvLkUOVU3bufqmmP7GPNzjxn3I6fnE0SJQTR7YTCFWp7ksahCfecDNqUJJBMv9a12W26bb0t8S2hWSGn8euW82KRioQiMEnDsapZBz8ewIlLkLnvE4uVz8refva97X0S5xexRCcCAM8A78d1dWSzoTY6gBCu44J0ArAidDNdzXMwo+PQQA+QUFe4ISDbtkY+NmKXHn1M08IJ9Ucvn5Hb+8PSH2FpwUea5Xs8NnlOPi2CpoLQRKXCPhp6o4OYx3+vC5SN/3/SObz48z/n9Jc673dKB9dxwliNnKSd9igFrA1dQAEgRAerYhy4w0jQVNS7qHJC2ChGAalgBQ4BAoMx1sBqThZGTzMXxuqpgW7ZyZPcBay/lBBlOxdT77ctT5Hq6KvQoQy73N8TxYFjhq2GTaghdL9IPPXyrvMSVuFvXimLNlHbCzHLCnremgwjO4MGwAhg2o4JhiwgUpXVMvDZArBDEd1dKKQaOgiEwbAYijQaqaIIf4ktxbgB7AsRNKqBaar9cq0NPb1DV9Vzf/7SUutm9XAMMMDGxpHq8EMZrHY1MWyecf9R1verTmm1a0VlHQwT8LkgFAlBR4XAKQUeIj5TdhnY7Y3rRj/z6JX/2l6de/MUP2EAcXlicA2UzJw72WuBERA4aOR5FKFFtk+mTc3MSiWnXQmuSB04P0nyll4YzdY1YYew82Ym8+eSfTjKxJ5aO8DNAFEuAgtnmttDjyG3/yLjn6vFYfcM1PWmuEa+vI/IOIYezsfaEXdF0hV3HIV96dqYNDzqkIZnALBCB/GBrNbKnWpuNmLRchLHJ7YzbvNDZtcK6JFg7tnjFtV277cC1AYpAKMY5Y52eH26f22/ffRzf/PH25bISxACbw+88rp87dwb4EWDFQNxl9XAX4o60nQi7HIHc7wtlWVJQFTFGpB3LqHJu1UTX0kLl+fQf4jxvF+TlIrZtmd+S86kfwIX29sSOxLwVYvAlj25RSKNf+3Ofg3f+wdO7uPHyDi++evELd1tGe6us9o8ORUaGBWFynO56IcEHfFb2igyJN4JM4OYamSOhRHJDTIE4FFOmGpXlkWAFmlaAgCtXo2IOWVnG1Y17POKStEvI6lXUO6M2suZgDe/iMMgXOXEtnhm0VIfnHF6+dYfT0BnL8p5WcMqVO0aIwwkMx1bQllUdGuzXslK0rSHLqQUMTdA5N0ChzdNt48L9aVfFBY9NxbCgywoEoCBN0jAM0kpCpyFmoSiQZHLVpBxEeLkoBqQIS3Y1HIBKqIoqiAxyIbfFRixsGlfEDpyAQ1jsgE1d39gW9sC0LzyBXsxZu3iYrTO6C9Nj+aADGCYuaHBW9vxYHM4Im6fqpGufTx7nyz/AejMb0+uIhMk4pE0qmgoUnsVxUoKvbFMRdqPRjyzqxjv7pZ+/0I/9+pTz39QLNSQvipKlpQTvypGnhKK3W0RMm50kjhNVZaCVsbr5/alKKgxBTICigp95U9DT9FYIWQDCpO2g2uJM0uDE4sHISFKBdg6K+EugGIj3h5C+jpidA+l8fQccUAV4HSLGwwy+GcUAMBQVHXDzz3eDIOhTtOBgvcFUgsTsf8zgSbnf5opATwnkxK44/+2JtRzOXnxUDR7jIAonh64ss4g4OCrL0UGmjpa1vUrH4F//qe/pifhY/+zr++3f2YibLHaAr8vv0PMLMc84FTiI+NQkrOj2mQZ0o8LH+Ujwfk1JALLIVYsoI3CnWAopIPZ5WZMu90qzdipxzQQb1IVVPdzHs4fn89OvvVBxZ+Cc5nKm8nz5wgFKFZjYpAJM4iNhfP2jK7eEaflFr50+2o8/vOg1b9/xxXz+XfsGHEUuQyufEykH71+Xunk8jgf9xF2x+qbxOp6RuLYXnSccCbgj47FyagNu453eQMKCgAngCfuUI/+gys1NjwGrBIS2lbWhFD6IUjpcZJtow1Q1IBZtJgD1kBkdsxNbI0edFtkOoa9NFndoHVKyCk8P1bU97PHdtrVSiScrtL5yuarE9RFlGTXimGbobK/TkxxhfarElOmla9PrVNCV+e2aumk/SM8dWhsM5kZ2mybP97z+9DL//SbCywdskyqgxXIlljhoCATijA+ylhpvdbZGzJotEjpa6SQtlnvYGDMAnKNFcLIo2fOWWQQOXHozhSTJeJqtjXQTJKzJocx14tg5oXkN3ACs66EjjZ0ydeU6THZfuT8r5yJyWw/y6snrqq6PHRPNiWGJYCVvsJ+0vZLGa1oxN962XH540av6+77/+2j9RdoZp0qoWh4keCEGHEIacgadIOEmFwmhFSFLRrQGvaG+cdv64f7+L8/4wDcnztzVYqyOGdwqNwNagn6C09hzjc8M2J975zs9RKS+483Yk99Ysjn0nNwNDx986RJF4S3WnC6yB+t1UAkgp8WbMMSCySSy2+HnrzPEmcQj/GunS2EEQVsB6g0t48eDcZPkqIv0A7PO+YP0WxDZAbeaiRYZjSwpCqaNJ8qPnWfAKmP7aeA8POxUKEtoBfqB0PFuJfu7AKk2qMrIpXn46XsnRopNqGblIll5RfOORgaFJz0pv7NWNFHS1drbQ0/mx/rpr97bvZ+p4ehbCmLgudGL6W5zdkPP/R7rGms7slFFK99vnVgxja2EdgAoIXb7po44KMIvMpASbwjwok1TVEtWVpx3ba9qW3B7jvO4XFSvWz0u1LpN2O5tq3E+uBBsN3aiBqDsOcerpQgT66Y744Uvmd/NXed3cMPl+c69f6HzeI/5qxmP27tlGVEWWEHZ8gYN3KCCJRVAA9hXPvXQSONRiVMQzLkjmxMh6M1cMPwuqymgCRRr04+wDC+/IlJ1VNS11vkkSwZNwIdBC0XopisDjh4aTK9dILsDm/bXJEp5pw49OZJzTasRG3qXjZMjIkdW9ZZejBgzEIUBjTtrNxMitobbBc++vGg9ZKKhJdBiLeQGkas/0MEIRAE3BJNQJFGWCthIbdjEW4bEkhH1hKcpRHpLFGrFSjysgcHjyI4oY9artnkOd73iYQFEcnJgGt+pPAhJqhM2kBw+ChoL8TPb+99mflgmlUwHRa/SpgkUOVPnsjVscWGakClOGVEBGmg7EqzTutx8XQdM8NpiNXIFbfm3NNHcG6+0iOlNBRdlsmR5ZdUJ/Dqzk/4VC7/W9+WjXZUTyk84eTVn3ta1/5Ur8sccntXN/+NPPJcqsToJZb6lObXoe8F3u5c5jci0oSQtFRtGuWP7p+e+RI2t6X6vnOuawjAmWCFJEhW8Y09iAUs7aqm1a99gb0MVD+KDd3w9dmTpNt7BBw7P+9N/evebznMji660qkPTwltogMH70FKURZL0kxLwTvZ7gWKkESIoYDdgpiiNSIWxm7BtLqoUCllpH1oSLqsxBre9w4ZKB2pxisVaDzx3L4SQ+Cx0gkf15W9hUGqhBtR10q0vIXgNnqSv94D/Jwf55QrwdgyYLyPnmFnV08gKtxtui6NGl0CR8hOl2KlmQgOEacvSO97YwqveDiaWU5MLQMgfFq/ywNXZZ59rjYxZKcPKBjosBGlqhbQVWzumU8ru5YVm+1x/8cXH/uUfbV0JR9PJKaF3yc0ZyZppsUHOUnmaO+g6GzDJUpsoYVGrlMs1KIBcXA4RyAYeUehgBBqqHc6LNM5j3Up+YjuprfJFkdvzfKHqouR5cFvoA5WRUU66xLE4Hq0VfUCQiTWr+5zPd313vuR1z6dvf36hC+tF9vYTul2UYndEjSQbuHZkLuvE8FAp2uaaTAlo0B0xIgPvwMisckJBwQKiOcv7ApUIRVG0bay2NQb0i8Npa0Wh0EelVeP2AHf4sGU07Ei5czNNyS4iWbyvDEwV+aS5hTzxvBGRVmM5wsasWrtVEoXLLJHLtSSXZ6x/4marPeQFRBmtfssK4e8YqTQ1ZdByLbc7lgOAyrwlm6osFyLQcEZNTadHu1n76hvwjJHB8tttnOmbd93/Bs2Z3siqwzDQ0NoGSM8X18MnH5Q57YqboBjX71gduqKOTQvKUsp2Mf3tWOqfeviwy1vjfkssA5y4T74LNlPJSTE/yFpUrWy37w4uP2BUStseyxYJxSA+DOPdFFPEAUJXnZyT8P/sx+GPV8l3Jcf9t9ItFa+/EvaWUaiMPJlplfOn/uNhntc76+7zB+W4K0wsLQfEa7kTDCwIucW5VmwcjQ37cvb8dy98/s1DDx3PPD1qajV4rK8REE+c6zOhD97t88esMxkfacWRTSRZTQvZdAsvdc/5lO/6+d3verrr3l6PuGQSpnEgYySgJQDnSwxwpfMAuRNEEqppPmoLijJKhfMhd786yQyByMPmhxbmjPIsFYISgzDyvU6nYqWSH+XkNz6ZgsVpaVgDRAFHAWwE2gFzdw4Ol6FeU/eu3vLkQ3szICeIej8AQwBD0I1S4FmcwezBasbfN+mjHbYJWJbEIBOvIXP8BEtHkloogizWRC//n7663/HHW24xRuiQxwgW0LQIHmTciZMa63t58vlz8rc/fdBL/elxswPvOJe7eZol6njkD1zrvYWgGwPFKhIvGhszPNVAJVnxGZqwikk3Cl4eUfNR844dgW0aW7XuMHYMt3nX9spbo3bk2Obahncqtjb1JdpmLAg70q8BVmoFYgLEvBqK7J9snMgzduEdXJEvft32XBcfn+vc8Xw7efep/tNYOxgBgy2UTogdRWFti8VNhRIQEAoNAKQwcFOWNC4uh7xzLqvhHTrWx4WlUAlrRYa2nxBikMx7KwQVDkFTl+th1Tr1o0qisHPBxRQDRb7pSdt5wtVnM+oDDbsm2ixvFHGQlbas5SoYUV1lWkNlvb90Fj/0+b5jM/+TLoRCFVhlrdoui1SGaOBnRJhIaClowFSJGvYPyfSQxPtXvrrfIRtFCQ6StMgHGhTdzZPLhh2f3smHpvf+h2NqqcjDqGVaTsbXpygky1aZ5QN6xUqnESi0NzXiQzgch0zYVjk3NhnS2XTUDE3oiIEKTZNsNU+63hfhSXeO3EJmvTOiMjS5nCv5spt12I74R95+ncy6JArI1Jgxq/mUAo/sP3PWIGd+S1fc1buoXI13eTxvw+Q2jlf+nToVq+If/eV9zg9CjrtnVS7TBbyWxQMi4alamql0yp5p02X397p1PX3PfOaZh0edOkRuJnhgdyRY22mBqUiUwAemxePLthWIn9Ox5Hjeux2K03aNF7x9nHz972ev/vN7XIktE4uOGK+XjtCbAo6lrxu5ghIcQDEWScSgKGEDNOlPYXQgDEOiUIrthlPfKTQFc4LOxSapWrmxTjY0Jo/up5KHS51YM4gtjUPR1/CXEOvLoOu9tPP3NJN1T74W1/9lrrlnKI2gmD3UPEdkgDFXfqTP1HcrnpO4I/Aqpc0RSCRYIjtsPB5e7bvp8MlKxaBku3rxi/s/8uJhx8+roo1JnCPlSOOiCeC1WK3mGnUedfr+c/KZ7b3d98oORkzzk6W7a9rCVPTqgcNePFhAXnqhGq8+a91KsUTCdME1X/CDnU/vVM6r5pX/rp2Z21XbnDuof+KPbd61XbxIsTX9Y/u7/d3+bhGMEA4CMa8+vYKj8d125Itfs73Ulfl8V/ieFxyeZ8fl9Kl2Qq//JgptSFeKJJX13UWIklZ2FkcyEreKAmscdQDiEAABY44ZdJGQlxBwT1jO+8uDgaXmZ33qhU8nzF92DqqnkXZYoIMmZCsfes2JQq8pA53UNcc28AOdH+bWZpuZ+fRTjKKWB67w2bRnbSMUV29emE69/OGe1+K8Z9jgYqKPYhUMN6rQ0XWN2saU3cmVBvxAG40bmbOtsXktznsDp18x8kRLU1XU6Dyeuu9y/tM3a8sGassK4QbfMqIljaJQyUOrV4Yf6EJi/8nnPdV7J9seFrgCypVuWpSRaIxUixabspy8N+92+6fTLnjYevLGPVGHDuvSVME0qOAHbZvcUmUpYmTN62qlwlvNN9g5iKh73rL9/df/G2TtAYXGsakYtcbJ+x5nJ55VRqIDWq0bkR/g7bUUbKB3Lan3OsYN84mFOubrccK2D39Q3RrKaYVnRPYgz2ujzXa/v8ve54XTy1tfJcml6yrQ1YXpOr1Ai56WzvtKs36SoKh0qnJWzfdnrdZv/ZE3SBlKyIYrwu2+2esXH/j3GzfeVjnz8o8eXQAca5EcFSacFdZlrSxyAca5UWhU73LT7u2Uq48vfke81Dtfbp6v89cez+ufLxqUotdUGQNr0LMUBXgsGPgIPkk79u9IHD1pz/Xz3sB73DE2X/pnavq7E/dy81RopKwbfBgAA3qpg37SxOEs6JW+U3o6HfJcQmGjZaCEKMqYQDPld4vAICRmAhjZ0zQ0rtaWO7uSToSUqH5LSsaSyU5OAtwkQxUUwV4Nz0GYO7UUHsa1y32RdnwD+D6mX24RYw6BV4GjAdake11JebnGnWm7ZzJ2K31HBtuQLIS3KUvp9gZaUbOoINMNQ1Ovp/v+3l942Te+i2opwwKsnKaagpKmPl0uVOJwt7eq8vLx3Xv62D7Pr1PJkjW1f+ZZjJOpDWp1t2TPqhF2K7uEW6zQwA17QZinFsyd+MDIWt15579rJ+PCUhey7qSuaTTj6t/mDnmHajvYbi4YDRQJ85D9ZQw4Xt0qiDxJt3iXWTzfZe0lrs4Xu+p0t52nMxYu99qWd5/lbCXjdosipjc/IVmJu12Us4iSYXlw2AYSQylT3BhXIIuyEeDJMsyUzJIZalkw0hxnEpMPDnxBT7toql/79oV+7Pva4t40WW9bjcKEr1PBtQMN0RIaGcc3SBVqaV+el1/QHU3feNHPbftolQfK8Ppud64UyJoyZrtXd7/29Dyf+M3Wx2a7NtekuRZr3TKtMoHpB+0OJTemr5VQJd9YOb6bC422qe1scX4htw1OyuOttdWyzg9SG43ne9+58ULZQZjSa62m275RxzpFSctOK5LXNKE3sIJuwmaLar11tO/j5t3U3TXRzktHJSDgAPITZm/nLvrNC/3gsXGou3rLM22YwqAr2qiVCISnqkbJqg69bt2yAS3FBxrZG/VdY/q0YWbdMIFI59fNLQB0aHabNp33/E4+/uHHaqVaW6aEifzOaEEVRNTuS2yEBjf90VXl3EToaFETjbpHXem9f9iwTVHZaq1QRghatHZEbV7YL/SOL/aR+23H5t/MTPsy02G9FaaNATZwx+FIXE+XBS7NqkxofDVLD1+ucZZ0OL9b8R+osvMZlWp58RvzIWxm585mwjFU46yZd+Z9vGXC+fip535/dvf7+QX3rKOGsguhR9wautoAvuvX/LRiIj0yZOS1pZEYYODcSNiZp4Xx359w5fpCt88vcEt7nvNZH7ucv3n8r+x0NshIECxwBkHuLLaUaOmDbxznKbvr7te0u95QG/cdF6Z/Pzt/f8K2OHF8kv0acWuqDCX43jSTlFFFQtNRhjgvkLE4mIPGB4RdUc1u0rYdPPy4NNoRhuTzA92A5XfUlKuaM5HlBZfgHBa6lhtcCqYTXRlTDdScC2OkgUoVj4SL81UqK98InmPVAdRCiJe2h4F5/TAgAjICFgOm5A5OF4gKG1AMdleYSZpyCJLc99S86s1dfKUJkwWl1b7+4gF/+ebMkx/fTjuuigk9byFNvQVFbOBESQbJ2n0Pv/+cfY73f5VHWfqcZnuP+XhSYAuxyTFDn0FPS1mLQANiLVfuLNoK5+UGng80oopGYm9roamFUjvTv8B5oWFY87UjWJbEoKAveHUubOzh1IV+93P83BecX+jS0wtfVPfaeThtZjltCieNxcaqZQ2rTG2g5Uf4kcW90lARLg5ZQQnxmtN2x0GLpcsMEMTcssgyBroAARxlWg4GaxFVvOT1LxuD83w/t21x29BRyiiNpKIuNYRVPNM4W5FVKdEIpsBUcYcKjxv2j/5Pt6yBWytKhUZuasl+T9HP2Pnynf14bF9ft256xxCR/cTbPkCLECeplaQmqoha1WrCJ65D+xqp78zmUc8HH++yCHzxT965e6mfP+5c2XbUtWOo4k9Zw5+cDlI+UzfYm9rAjeGDm9J0qQgN6u3a2FMtt2NBNFZIwyIF8iKwXMy29s973fU7/f8+/32292t+4EZ6t4GXFRqtcVWo8uNash6TWiVdWvfWBUWjeGMXm7qtEWUUEbaACChjgbjbhZ+/gx/JhbXLRf3a0bDRWBXqgnr4C28F3Ug3HItT5uSDXKWidNENrhFQHZww0hstRpSm58pwVeQ6YX734h9+tXNz27Gx7diqhjmpyVpW0Zy1S7fSGWNDnUzD6jrssvb+3fSrL6TuehXXfY0OCwcb+VMz1++FQv+ZY2YXqQ/DYf/Wyc/e8/6nr6UaRO4VCnXT0x4NwMou91QKjQWxeJp7GYeJNxEmNFtNW2b2m+ZGbf6+ds6n2Usf7/bW+xd/l5//3ePet+ke117ucvEWncX8QKrhB9x744+qVljrZG2E9THOjFd9eprbuW3Y9Wlm4jHqHGZ73Dw5bei1mU5YU3pYlVdGAUydlKPC9elrCUicH3k4khQuArQVclNBQSNMlpcRLmVllCE/LVCCkFZAKodvGVG3YXxjcfWImcQQTDoV7g65SdhBh/GKEEvQgVQJSoJCENtR2QsaOgQc3fpQ1xAI4JTItuZ0rUljCYrW3Jai+R3ATN//GnPaugn9p+4jbFeBhDAqHCXoxwLDMGHHwmStVTce9N9++gqLh19sUeXLgiNrAox7lhAxjJ39p8/RF7eP7xtTY6veeBca8MGSAUZ4Uj09YxzQgTusOIzgyBqvtZCaR4AAhKASFGtDPMQAzgJeHUsItdI2jOTdtuPFrtRLXrc9z8WH03eOeyzc331uf5eJfV2Yt3tZD28hLpRQZLv3E6CAIoQ40TZH1pYqcAgOQERhJLUJKrpAISKZkyGDfO3xs+0JSxaK0IaW/FouEZymyRHc6tGycP015cQFelbwDs/aIY2Ov86W8SkyWigplwkIiDigHZlWKl0NONYsOFZDc/SNI+3EbcvraIUi3OWXTEOvcyAWGTCeuiJE+LX/N3HfFxW+AGLKZAVD1IMbW/3kqVmJyOEAVmT38cQk0pGb7kk6rh3B19CCMJWAMKmLG3rcsn0Z6NSRtdUqipJVIT18Y6BYGxYMrGugYW8QYh/ZiYEzLW8aj2eqQpVV5X6fS4Vpx4fjKAN6eXHcF0Hpaj3qvtBR+jlkNet0aBGu+3XQfn1vbsCa+VA3ThoBVY3ONEBejj0UOflludBJJNdSslqPmOvMm8eXE+b6lgVt2j1OvOB06pXH02483+1tq1pVo9+jYZihnrJHV/nX+mnUOjKjoza6ftVrberWIN+dK5jl47hIA4UV0kDpM3ZVgE4BoKw1hYCi1TLL8R22ktscRu5PwIhqoSg1IQHVlMUFr4JqD6kRwoOtOw6n0s7ZA1da9GaYAd5J7xhCxQk8SZvT+4qqhWUofGOY4Y8S+GHJnHOIOWOrPTZVQAUmUN2G2kEfjJPCdmd3knanFmH3QrjyFMhy7vNwv/JG4qoUL5+e0L97hX/94iFH31v33EBlBADfJIw/mbGWpKVZ3+cLT5+Hv2/nHLmsW8fupfbHV/9Av+y5hwh4kCIo1HIAV12fWTjOSkt5KHl1HlAOU1xv1ZZx3GM3X+Ci8bwX6q47cNfdT6fM5mlj2xkLusdcbKqk3bu913BEIM27EOjTsjgLBQWB2MN6WZZjQSpwkDknNDW7FfU0cokGflcCzjsZYKBWjI1rWdFuCxDJJhkoIryOX78MimHQKFjwoSJixQctAi0sSsWYETJUotWsnWvoQ8HimJBHLiPHy89Wobg44LxBtxeH8xs7ShULHiUwUmjaa7WxeJAYYIhI3l0wBB+AtTXCWpzfmPfXVr0VytWG2P6kR3stZUwlXkqyd2zJlQY2IQWN0wSt3XO45djrsEY4S8jbWlAjkrclQRsS4uX0xjyyw+DpK+WAAH1jtq3rxhq69MZbfOELFucAAxKMtI6QaG792hQ6Cgz0Q7fVBFD6usGs1AkIIdaqAOZxFYBHqlaQUqu0kAwG47FUNVQrqrVUa0d9BHNjOTe5pSppGy5kvrZt6vVUaa9bq+KxdyoCbYWOIXoDK/pBzIAi4BzOsVhL1oAEIJcC+rSsIBG8TpAGG7XMsdqPdnjb6EnYRCggKD/OKnJhWqzPgEsHqdTFKDlF4s4VZjff2oN+YquRwiQoNDQU2nJFLghmhroKtNYgAJCAP90iRs9N1wOdjndqzj4TQYBvikrFbaAwdU0Ks+1y07OGe+5OqiCKvbQ5+1HKFlMtSnhUR73Ow//sb73y/vW8lZOma8JIPrYQoCiA0Q09wqVnr4zP+We29/MwIqrPrvcpAEooiHcDOFQWJa0SSl49h1gcOmDa/a7z6/NdsL3YlbjPedsZu44nzK6be+vdt+e9treTO7sa5GqeoEGDioOLzGJVCzJRwA3cCMAPJhEoUlhOuyO8E8DaE8qMrKB9MGvjeG1GdRMYLQjeSMAIjpFdm5g4c9CP90w0MqYSAxikBAvAiBSeyAiuSGzauzaEuBIGRNg/tpU8Z6AjOnkyUbIMBIgna3HfUrm43VbVioQnXlbiVgsV2PMUDa0DCiNQFP4AB2iI2e79R0KkisVZG6iAIlMkGkU4JrINFAlWHpXHs85TglVxO7fAZZ29V7tjo9d+eyU5gNhrIrYgHDFiUow1TCh80ZBjIxAJnf5av6VELViVI4XktkSVcG98Vadt8c1VXEwKT4Q9ceIZGU50fsKVDjo/EVJfY2WDQTdPaxnW/WMxtDttoG4EECAGicpQJ0A1BHzbdceDkGWTTASDxIi5EtDISDVkaDU1RvI6+wkxTkI6zjqRXOF9bMFaf5AmrW43y7iGjutzMfvC7dJFSyXKwigUFHZQktZi/HST3S0wwsIvSjuxE0WgSk69SA1XynbPiVUxJNj1ptjvCtvmWUfcWewyAG6wGURCHGHgUsALqnFLYza/tbtzgKZBEIvPgfyiRhuJqHOSTq2qqBFgSfGgJwM1qBqcuaBOUi4PMyZ4gh2p7zycv58QZgpNkORjEz5BeK+/+tUrnXin+pNCh69XKkMSD/ExUFjBGrtfP2rWj/s79x/bV7RzDXwe5x6HPsDcWDt1Zn3uPXqRC073OPdy2o7zKbPn03bglKk8Y7rfbVobqtBZzzGOCAcNi0iIH0MeFyqxFgXRDYPSGEtbEAsz6aTHkxixUklWlgBjSkNZyvcEKA9mKwcDcLObJDUbTSOSA+5GBAFKfDUoOod/O3sjsc/6pVHyMYQ4jRX5AQoPNm0DH4ySqRPIKVxkrD/5SflgMLyzXaqAG4+Ap7eP9nSTtiizLmVZU6m0xxMayUuNJEELOb8duYY4NDBLZpaxqqlCwawdX8PSJZc6n8OA4sm9tS4B4DBHSQuvlf24zxUc8TnDioKGK+SrWmVzwGRfqQzPgcdyEHji7kJFHhmOfSmw2vVpOEBDBYOGrQTSwlP4+Cjvj9KXj7pfZ3byygv8kT5MeFHe7TesgHzAwsLT+RB6Ra3AcHxvjj+Ybb7d0a7gHL1jCOS57BtV1diLV1I7yyT3ReGXJ5MQ4InjiUHeFUro+XTwhTseqa6MMMosb7VZ7X9TKRKuiMtr0NAJJtouFJ1qHI9TLXQSY+yDzrh7zz0I0ZbSGS6ezVtSpYaq5Qm7tDmrmEtM+rrv2VUi7UknAJh/3HeBSnEOpl4thKBMKhqiQJRCBIgTEEfMoV7N883hsU/fKNr8SwE+JgkrxjwDYAdQYwQT6fn1wfWATXIPpaST2fqOrHVBB1BaiqWtU3jJ8y+MMKmgG0DhGhup7NS+/Nde6TPt/ivvNW2iQ89YrWV2q2HkuiyN0pFhXdZpZaVyr3L4+XP5uXyVZxHVG+z+PCYyVqilCmfbPm0+771nPO8FuMc5efcFnDJXp06vd5k5nDi7nTAeJ45ptrhWqq5RQ4etuhYiNxvId5ccUsZ6g0bfKQFi1p2UsXcEOhGlAdoeT3CUUrYzYESbsocfcQVZZkEGdMTA1ajJsgEid84u5wdYfY2GigJeWwlXEADiHOIbOh8Krig0cgJow/k4MAD5OpfeyeD1LYiTy1zeVkW3MY7C0rBD5BGe05BZHHtlhoRddDJGXj/QXTdBGS6SK5NsFAHHYmOq4tyalybGoGwlpJZcFOEyXU4D631rV9Ww8lSDQUSFFIqIlFgDBg1MBjRUMKpAQa8EiBXOCSyOKAIpizUIT1YFq/828jv9lr4rwza/NV1HZkv/77y3w79TAOXq5L+9nmWfGUwf/clc67d3APm9rBLzKmadqqqiSsLRsMag710yKMrBQKOBc+6AK3MLYLVBaWiVCsSu2wqtMnLZiFbDUNTK0dKk7yB+4jfo6r4SA9cXWiIBV+LLHPDumYz8Pm3duOqmytKO/JuIgpkkyTRpVHfu7gRhZlZWtRvA8KTxdLYhvUi1C927PT+WGCBWEl7d5Yp8NhDy+lQ7boC6QoAJFcYq33LVF3CtQbfK6aMaBrlYcwPQHCJXgHEDwP1290dmdcVaHXheXcsgt0yFXWd3aaErZiVOL3baIU+RpaGsVRtor/rP/vr7uv94Qf+i6G/rKxZ3VgN5j3j74PS5+MLp3X6NC/3i80jKoqAUWt40kidP8a4Lvueefsrc8S7zeer206nz6+YZbB67nDJ2vuts3W1GJ3Y8U6aeWGJ8eQ4ygq41sjK4W+gTrOnXiH0RiD1dUi8h7gdKsohASsBBCVJk5chTOhVGwA0dqSnaNu46QAMUBzgp2yUMKlS4E/DgrADE4AND8nhSAtkgp3nIihziI1nJmhQkIAhB1lbdOA6xk9CEAH4XcteBLsTENHVlVmbIoqKIh5dBgUtIbkhJfNFZSVYT8FQ0zyFOwMMEKpquwlpBzuIwZskJxIkvPIVnrT8v9y89r/P9cET7Xn/0JH8bNK9AAaaXJo8dBiYex7zrG+SYNa8kKwNU4MT7XPKJhyrPcjQCPxWHkDulLI9JJ+F1yqGbjlsEuh26LW9BASFZSURLNPW+pKkwDuKskOaYjJDniQjCqBmsZjdydfHCOI7bBmVQDpppMF5Ylh6DFEDZ9RhqJk+mMMpj36WupHTANmCqoKCtGrIB6lOIqc9YAC+1voHs47UDuyzYckbqbxCQ+9EYn4GdJ2q7Qkkg549ek2qBMu1OTJVAiocXPWvOG3eqwt6eNYvlmi9bVt+8wu/+4EFvfLI0ZWqEDrUAZwWwEPcW72X/88f2TTziuK9/v01kCsivfqatuW5sGqkTxvKkCZw8w1PnxukL51Nn84TxcfLM5aTZPGnWP5uTxrylu81220ylmdKMOMZHQlp2U+cC8S3egrI96k5vIS5Dka659JZ2NxUWEYqExSUZ0qSEUjJHbypOPNLqqppQWjuATlGgoJBuMbp8TA4SWCwemNDc4hB7QHIWh2JA4YEwGU/IgRDjGcRQJp5AGPNolgAeAqFJhYxc6VnsKQIUBSRxHAIeH8Z58Fzc4Lm4ASRnFwuyEg8QPB488fFBnuMeh01IVT3Tix5eA7garSeOgMCAqRUDJB5WAKpwnEwEQBIPLHJlhgAeyKE9GAwkkmFgKaF0BYMkJS3yAfRdAGHpwi1RAhJyEFAOQzNBgGm4cNNwMUiRXfVIDm7RgzX+ItW6R0X3mHq6CJUmOxstqnmp/KzRiy0HhgAjgAKkI8jmbPuW3PCNZJq3DvHl0iMvgNkC5nUGyiqaErpiN4WKwGwW3ArD+6BWsGsKSQBBFLJg90PhSPJzB3BXU6ysGdx45ofv/U949pkH7TCmjwNQlhEs3cDa2+vxOf7M9rIPZVQ7fr8ogA6GWqBWOFNhrsMTp3nSZJy+UHfbtp0445Om64TJcdJEbh73prHjSZPbqdO4y5RPGBtznaUmXTnyXlaVRMsKRADArYEHaxYQpIF8zBpxcC3Juqw2kdgJo4zFAhQZgHgEBwLaBiSW3KHixbCMLygZXtf1PLoHHS5moO+4uAbQ66Vc7AD4Xbr44tjFwNIBz8Wvlnj1WGYlFzN2RBDAWL08WIfHbAiKW0u7csGogIKCB1gNEoInyZyy1gtf+gg5odzvigLXY9BTyJEVDLJCcMSFJwQY5rRi0l0Y+SYCJYm2km68R6PiuI7Q7mFssdnSTrntGQZ1SRSZxjfZS81paZPuQcFQpbjeVEG6H9yyyle4Ro+JINQF6g9kQGAACfhV2guEnIuwNBqyoQAgAbZF81ShfYp60CAQBAQ5wlrdqLRzRgMEyd6BZ8Fm85xkKYiZ5T6nZWQ6fASWPOLcsUs3anrAf/3pKz//sL0PS+9PVqEnSR6CVmqvL3No+7i+0C5c4qoA4gQHghMH4hAngEPco8cIKlCvMNPFN3a2rdle29I7n9jjlpFt00hs7NUJkzxhAlvGc+NIbehp08RhY88nTtaWseOmMWzs5gmjOHEsNncwV0krOg3qoAI1URneH5QQWyNgATEcggBxAVjRwls0ZnRlCS4vPUDJYl/mmQBeALws8ggeAdIyy++uqXmv3BgWcLxIU+ICMrk4g3wgBUEuRp6kKYNdCPgQjvgVKSf+YrwaltlkUbnWFqRZUx/AczELxmS8OnQlZALCyF2MMKFZwNQ4lvL6AykRIIJCaNGWXQHqBBgmEATQmCNABj1uHI69h+B75WVxb7Q+8lJkXjIQgMJlrFGOQyAQCPihEIqiF0iTvIkUXnLog5YAHFMDtUOeMtDWREoq3mx7/+gmiOkq9nI0uZ1tdcmaBrvPMiH7/HYnUSo67wpbmmcrzgT7LU2Wh8kXYqDTiBuSw44k2hLbJUDbUIji35ykXIF4rC2fB8YZE0V7JSayMnyz0IUrCcMNvzfptsEGquXEEBw04b6Pyxa7WtAY9pQUDl06u/TlJ/iPP3/Aie+ibHnHiBrk3uPIlP2n/AQfirOO0BqrB/Krrtq7G/HlnieLjFtuPH56GQQCgKwBcd6FvBVMuFaxXvxJ/yFm25hr82+wuZd3XcgTJ/393Dye/90Tp3HS1GnLJDZNrrMdzLXHCT1v7mFjK39ZG7qabdW/7dmDXtlyisildFZo+dJT5hY7liwoAxbF2SInQDZCGF0hUGYjWTQShFf/IUVxwxAAl0SQAH0AX8CkD74gUAxIVlm6yMoMgSTCXMwIDKDwxaubNk3bWemFV3uBwr9aFSBA4XG8mgt5JYAKbjQlN0aWnMhRWSjgRcZUwzGAF48gIlI5TynimyHiykzKTAoWF54ChURcyi5qKDTvB2B5olGvZ9QqyXMw4TZt2QPtzbHtph1HGCFXmxebXqQN3qjbbCfKxGumws65Q1o5mJpFtcGmIXOcEEgE1WpUdhsMs0iHqxvmyDeYgL9iQzitdaql9rrO5J7E2BirHaxe9GjY0h3Ozo1NIbVMJKoF3a7SsH51Z3fT+awNspG2pne3/h0bD/6ld/sf4+HLj9qTXxVx160oEMe9tz1zcX2eC/xc5/GuCzhlmidMcMsoN3V4pIv4uCQQe8rQIqRlwBtRh2sF/2hdUCuWWvCyG2stmkC9cK5wY7c29rxlXJvGMTdSG7qsV6x3vKE1NvVqw9h6wsRppu0NHW4a8YYRbOmsm0fOG8e0YTQ2dLCp65l21KtWA1EDHZB8lDHKwijGSUIeNSaE9PZO8MRNym7alSU6TWSUWekKcaNMRqMMwPN+a1KExV6SDCgBigIoCk8BRNhJAHBlVtJ05IBuGi4GIYbAq+usBJACyOTVBvC82pdQsjgrX62QVcxXRxGwbojHoWQAY8mpI7K8Bw0rrF0tEjwV/YmXCTjJHFKSQUbpgHJlKPEaOIo+ZRYAcfkSQH+Rc0LSkY4m9hmHltCoZwE0NDy4kcMDtpQE0YJcg2HGMeHxFbbuQNtEK3Of9lgxzsJpJU5CywGPdtgHNEs20Fl9nexBOM2pvDgqutXV4wPZaAjgh2COCnQ8CMCozkZgkoKxc7BVPiycG6pu5I2xYoE4SZYQ4CNE7v2427HtYafODCUffojZbA/9X3/3lZ77ftva+Nvl2lhjrFS3hu5oQX7H1/Gj/fH+Kf+l+dP0q/On/demT/c/3n86f+n60/rJu+39tiNbpCaxqRG6H7T1uDtsqqMqWjlPD3/Qqqaqh/9OP9N6ezWtqhfUq9GuV+1HZdr5SddLzQTqIdWqudY60xkbO+PErjf3tGE0N41yY1dzbf0mZgt+fbWQtA3toLNwpRwpyRs1t35N5SS2gjiav/+1q0amKVXcCWWrIi4nkdHFl9kID/QrcLcgUF4hZXZLdo34Re83lnG3uwbQFoIXgH5Gl+XDkgwZYIFP3xQckrBWZqN2kxHtjLVsDZBdIown+FcXBRllVmajy4G8yIDSv9o4KPyrmVDiAI94V2by6BNEzrXR0tm5pvI4HiLrzVl7+cmwBGVFaxBFQMlLDzJk18d+DM5nfuQ9JZnLRoAzzkjhLVhz4spsNMpWCsAz7qOlJg4SoB+vTUVbFGXnGAND07R8oVnHudt81VkzcQIwOdo+uIjRjPerdecverSgkJmG1KgpWmliWuQzlOBQekaw0aR8oaBoC8ZMzvEm2JIcNi+DNq1vOJFqaTrNmHwBOZ8nVqVCVBgbFtZSUkdTl6aEJm/voutD+sSwDUwASrcCbKyWPo1/PB5JNVQNHCUUvjQxgbmN3Sf4M5894Oxbm6EcRjRw+ek6dZOxV9oLyY/47f1TcE99lHeND+cuvuPb4iVu1YvdUi/xlrFzs83Tb1YNlMAHRTcEbAJTaIuunNiI19fBmjxTeaazbujmltEx16rNI5jtemY0aq2cbXGmQl2YkepkLULR1lBwCKUnl1tyHxwjHwFtrFjDRWGQrFTmpW8yCUQKfBvr2HfFs1zwKKOcRGn/pqSgxNLT1Jrrb5UR0XBUjK+AN/eld8j7JdRNSOezkLjoShSinfHBwhWU1gpAe2XfQdoZJdlBDjbJGNG0jd+1V7cuKwGyg/KB43YgY1RyhbxaeEA8r9YZ5RVQZgIOwMmjK8f30NoE/TpvJPjcJp483z993IdsXfsd6ZtLhHJ83kYkyNNMLNEA+iZU7fp4jEg+GnEdUl5BSdmGMuvaLKqbb0WykUKu6yuGwPB1aVqUnj598jf1JZDnYy3lGj1r9QkPeeJ88eAwFsdUBRJ1/ZrOkMtu7fknfTxwL1ShFphTX2AuirdpKMQlkK0oDZk82QAgAmEQqlD1ks7+NMP3rymqfeNJ/Cnwpwb8dKoi7yDsHrKWU8yK31Wm3aUW6ShaeXTh1uTd/ARiCcwxVdPz33Z+57/4/lwfG1SE+3uUUml8iJmX/ubn4dfm+73xrXIzjdKOAmsWFMVIR9sQ/d4Luxc+/+6dXrH/cG66/kjffv1R3X370d5zVzNeu2XNfbLirNBLKwt9YowgvvRFYaANXOdVsiYoYsr+kZP1S6UTGI+yZzEIWUSFVBlkh7pHxqPLM2UF175lNxHaF7POVMOD7WzU7h3pr0ci6b40fdMYJiVZk9iqvUn7lsyNBcZXjG6hLQjv15bEZY7JRrDOQQgaUFzBB/ZOoBxlpVxxTSaA4Js4Mt6vLBllhWSle51e6p0fld4XuFeLV7cZkOEoS0a0yR5dkWxgj2Ve7g2PvOvXhV0/2/Tg1ib5SIQVz03ySg7kKFmb0RiyMiszYXFhqHaWZVyZ9cgkO8gnLkCZHfRAuz3KDsoV0qqsXTEUoK8lwOFX9o1jko7JWHagrT79vqEZtavducee3/2/Y2GzerOjnMhgEEgqrJNb16UrK7kEIRRyj1Xhx8K7Lj8YqKCKuEwpEztNdqIvmIKBQsHATRKv2rv3F3S3BugaEAAS8Ntb0tOcrc615SmTEyD7z8aktFchc7zDJb2WdjHbvpgowe90Oa7u3f/F+Gh/O8/Z+bRVI8J5ZPYseOO647y//Fuv8M141OInq90zvAwmPrtVGUrxnJ6K9mZKTIwwfsuYx3DAGi7cpII4/DimqYbHgjJvjeA+9lsB9jcIcohXj0zF4u5u8FJm3beiH7qFVQHE4QgBcHkJLSiddElLTzcOQHZLs3CEJcdXjEQc7zddthcPgmdxVkomHhnhwZUIuy6j9zvAI+BESMoeeGDE5/F0ZGVbsrJEHj1IVORl5GRKPHQum27LDuiNVmEFh8gBIGpCYm4j4rMsG7URX2ZlVpKNEOmJCHghYyTgKLOywlPKCFdOAEeVgaMPyDr7jsTAMmgLjRgXRSHK0drRjPf65+NBf/fD606iDJvoRFPBdyXvZePqmZ1P0KStUzGr3Jj8sowfOmeSjq7F7gyswE4JPRJgeTWbt9o09Jr9MtqP1nm69A0p0EL17cvg6kWN+jdJ22ZGjGvWKA/k5F2v/zuRiKGRM1d9onq3iWlEMsy3oMpDcTg88E9N6auzjAhAxkh4bRHXnw282vQdfwDcaBYpVtpJ4osBmO23S7GY+CQUGrMWCEwIIaa5FsvxZDSRUQ8pIONw/HFCHJC+Lj7qWLN090qzAKxLxx7SSLDK4gKQaS2oLGgKKO/oGTDe6cfEtqqgAsSc7XICIiOQI6CZEWVQrkm0Ck1z2nW0OQyIqFt0VCyLYpuoHgHULbplQLOZo8wwb6LlimC0J0AnMBw6a8ZxxTAfSACWGVMk04jR/Vve7ZoPczsO/667d8ZaV2wK5q3yeeHEdwuVYcMlG/HDPgs79IasfkUyQbY7i5N/u6m9hr6dc2cJ0AKigGoBdgOnq9KWrz4HLSrSs6WT54zfGuB2U/n2VVvWL8o8rmRCD+YEHnGB8hHWfdOrPiYYWVqcXTZH/Twp1CBM/N5zy7frMB/q//KobzIII4AwWSrX9qsHrzasneXDbDAbRpGES0tLC2UNaIokvsgGHkhCDAT8omxftj5qj7zBEIQ7mEuS0SoL6MtgrZ7p6cbyjdCmUOrYAhOUjuYIx7Gu14kyQQJGpVVhgv0SKO/wBqCmgBpqF9C3kRqaXEEVErSrbQ1BNEcBDhovBxzcayoBokpzLKRCUwA84ooCCZIarhggKIIiaRQ1xxxA46gokYyMCjK+Nn+sBnBMuNxzMCZUFZSlNaisIK6ztuZWpq1k0Er8MR21eU/feN5W0+Vmp7DxoMBakkrPyZp3verknJ0tZK8G2brctYJDftpkt8IkwKyWWd93rDhWNVc7YEsoSpU1ZHfV6VtT5WILLNKXUl8Cfl1py+Ug6W92zbR7Rpq96LpIV4ItJvaouFP9r4vqJJKFQQ/Rilz9ExbQeJo1O1pBx2Rh8XL/c7Lorq8hzREURHe6nDb8oVdrTrr/jBgkASERBIiIgAooTIZWTJe1sFatra2vZ9l6tp5la2tGXNfSZKLMWyXLpF0A0UlJTM5zBbpSS553C3T9PjmItgAdt2sKY6I7hjSxpOFJPAMJ6BvS8gV9XUIAjHdYB0QBTNBLsQxQx9v8VltIwqQs7Nn3IMZNnkEcUdqVZCiImwPmFnHsxkQdLJIdoquZ6kFuyZY1mRjwDOwAllO1mOFwOGw5KZQJg+q6jEhALlG0k+bnLbOnRlF71Y8eEJKPLprF8R+O1Y7GMnlSLszcFYvZvlj9Cgr3DcK1arh1Q1J5I2qjswFXwJFCfdJ2w/Mam2vM75qkPKz8UiuwvtNw1Uznf4M5/hmtkQqoLKxM7ZGt+44U38ykmH0yh0NfhVXPQTsgYnNwiJE0w/m/48Y+X6UDCEaZkVrCBLaU13T6n3+XOV2hOaQJDzVLculDBkgAmQRfXJeluVg4Fhl3xuNV8iIT1gsv3iFKdFUR/ExCoWN7BOhw8FDKojS3egRqUgiaxmUCYHRqnFUV2NdxTz984Ve2UHinFUARwBOXq9Z4WXe+mgBknaWHfQ97+hExV+KtKsqSSlNwA1TcANzcaHUDrRlwwA+WD3AgG2QwQG1guGI4HA6rpqusl249ty4rxCEeDOKIOqk9nXT16bLIUgnZLyYfAKIKp8Gt3iysOQk3Vgf8ZqegwUxNVt2zVS9JUJODHERxRyoPRfnB2WECW4AIFaW04dNWV3/ddc+eMvrKxDeuGZ6WoI3F5y+4sh9o8RVMsQy5pA1Ko+t/16s8Ek0iVrZWV/0csisiGfYhIDl8mM284v852fvGQlcLTsmcqarjT/pege0mZE0apViS5FIi1QCZl3EIE++9n3gfQghKNsJYRMOs9CKQDSChGRIUjoDoWMf9yFVh8ch1Xcs4MI4wckFzJKknoKeHfvQv9Ch8XtZGnVATECilZ+EkAIqpKkl0iYtLSwKQRkK4MaUmmlg6I4TSs3AIWFBAuS4EGYaYeDDQyLTH6TeGrZ4Icby8CWJL+mGu73Epac4pKAApigz954Wu6v6oyXZsNq2k+siSbzvVndFZJT3s68DWqaaIyxvPUA+nVb7Zb2AyHAV4M8DNVlofjVU3V0BrVAZY/N3JTEpHUfmdU8lsliyQ7eHIH4qgM02QYQIo7ZBjr/QniqqrYlDzE7/05VsPbvpfDP35TDNNil9k0mWZAHhxJZ6l88J7cb1s0Mt6DsgIQs0Alh7qyB7cfYlrYGRxtmX8zhwwZUn9gu8LQaW936NgAm6gKMrDLSzURgIFMEgs7bECaSmlG0vhAhw6VIvptIVty2w9JhIH9DebBJNNfgyv1G8ei88Es3MBs58jCM3gKlv1cibzMRExsYvn0Hdoqk9ZdZ6wGVcoh7TqANA3tLQbttxOs3pWAEQD4yfBog/eHCLPt2GbgmnnzwaRTqEck9K7XvHkHGb/3bKvmlUv1McfXhEKoHgYnKF70G8nJQGlWinBKMEMxIbPNmtP3ZdNMVRmA6nNiCCp2/Xee0Agk2Y5eC9eslwy6clKFagJaTlnn76ts823t2UR2L1x3xLgSZcBMhHEAVMgPQqK3IgC1JFR9BNqgjIaD78mbWtXWgOe6rxZLmVxGRHTQ6ItB+mKgZtGPXPRqRGlMsdDY8ebJd3D7v+2KB4GLo0GKKE51oqyWPXMFZZOihkdKo5J+ZzED4wTyASblAho6IPpX6ne+ASoY/DPwje04I0AF+O4vPE0tPvLVHxGxeYvStQkj0np9xbiy8TVYl5Lc+jHpLDqKSQ0qvyhOk3G6qKPZORXH6WQUhAwEx+YQxpt5Froe3wz2BOkQUOaSCjvAcCSfK0t5Ra5UjzSBLKyHBSDg/uPFYMDqHC53e/Tpfl0V7IvsXQSdAm7ATJgRObg0bBzQ2s/36WfIYRYUR1GM30bXLpmXSqQJkju3045WlaF5ElhI2fGtGXv0Dm6VtRBFTRSDhp6VB4P1HbEXRzTaQmzD2eTYLJbt/pzZ2p2joYq7ZPKB9J/aapkWiKcWvwlivVd3J7F9XbH8qVd8BML3+DenC8OVJe75OnH4XFb8YZ2T0KxTFpT+8CqD6w2FmxODazqsOeuP++0A6gAUllmr7jf7zYwlY4cbSPLJCi8Y/TDWT8Z+ldPXlfmBK0Evn/o0KFFWlzx7Wt6jGmeKeh9nsuVSJ7nULMRAKaSl7BPVeqQ9fEhpctBWVbTeCueo2VusEdEiXGmrsC+jnDz2nMyMZ3DePu7QTbsILaUt4JJMKCYuuuk41idKKLeiRMXUrVYfvOfebyzaiLEDEM45nQqsRmfbc6p1N0KQPcXk/CauSK2xpdQ/NB5tdzjHppoEkuEdaqRq+NjrruqwOd7ABrdDF8trsFhkdY3x2m/A02XiXW+OZsSKoeiciA4hQ1nhVc7G39+4S0kWkAIAxgp5Ll5pf/rJuNdWqsQjWZrZg5oCrn0vh4yuUEzyeShuZqZlcusCvDiJsoITbwAZAieppINwCHbggyeQWW8rAuONnoyAMPToyHEnIWmntKIuhlvc8ksq95wiqKIC7hNBl4oM5e45fgT39DpJ+2p/6ZCx3OVXrts+vbBRfW/zWo0arf4Q/nh20VL1bvJVm8YEQ6wM6l8D5U9KZeQ1LDiFFTUgmFPcltpq9vgW3lRw+OBAuuhar8pebdN1xVAzzcdEdXBlB6gtJtLe5iVFnof04ZfBIoNQMz+Kbkut53O/x0YDBdUpMYiYxjBjYN+WMi7dlhGSmQCOSSBlhahEPrH/VhEZKRxEwsFPIVlgKw45AMbaQNUARIPXABUxuhzJCDxaFhA3Rp9hygkyJG3v5EFMQQOqdG0AiTJbQwYJ5FAnMTB0uutmJuM+uRlOSRKdperLB3QWtYce+mZaYOhMb+yIDV0X4ncp5Nv4nN8ONWZVN8sVB6cbc6GeCDYS0CdcrOBur6s8+Eu+ErhG2DwZgGGseTNZXi4ouJqZJNikdKUT1B8u5JMQTE0Yyv9H+xSJ4lNlhqIUq/Nw9AMf0lgYKJ6kAApYCOd7tacG2LYlSzdUJxqzoau9xWMcocRi0pEkGaZ977MfDZAMwk4EA+6RGrU5IFLABBvazMSJN0qmD4agshctEEPOKaYvgOsMgdLlkUP5LaEJCGJAndKyxqr6cDZdBhc+tazExczue0u4sLKSrpKJWYZ5x+96Q/mJofmhrdP3dk0lq+h5znkezB2FKsNprILtYNIpmaeRi4jW6fyx2Q6v8TuyQZ41Ht526eiEfJAB+Bu08XtroZvE3uceAEjAEtaiN8nlX0vzurfuo48nf5H4FuqUMpMkMRT8gjZeUXbd1SBUObKc83/OJqzjt+sP2oIwJgO3d6OGqKlVodKSi9QUQHNCkR6Fl1Z9sgKJFE9IKo8vAK4OR4B38xhGZIJzqNix9rSSIRsvDMmIrhUhFiVAs7OCilJyg1pULJSrnnCkP11YW6q5qZSabPOCPQ7R1XIBDVj++K89USr9gQwP6bBBKEdiRad3o0wdxNjBVeJO/HYVM/iH71UFUEiGLhC1614vdkDdxvvLED6hvgl5qfHrXjSIc+nZlx/BLZvwtEfPdVqkg6D2nEhfiQ6FreDB7cdNv6+SSUwYWfmUEkrPPC3BjUSQeZMp1IzwjXwasJkkK6KSDURmTCpKiewSyWAjLxkwkY9AcpDK4CbGwgw0+wq5mDAGRR9ZLR0FFUQyCbo20fIdpAIKORooSpAT+qX02wt7thkJykgoopDm0aWendoR+60JLGyGWxfxfzy3KhPLszy8oyKnW+2InqmcmVhoWVlasdDydnFU/OzNiEK4BWCPovcfSouz6ZgbF/a+Z8XvkEW3l9cjbPdVG8+Vd2MV8C0+LObSnCwmpPqQVVhPAfWzjNILYd150/InJlCFZnVnpTBK/9/ZFUBc/uXtteOGLDksdjnqW+d3viUac4yocViEZgsRVPpaYCAqCrNpNRE0wMTFgtAAKAKivLIWRFtCKiSUMF4m8/0mSlwyAbkPDUAvwZKcN24kxTLsaW0VjMX9dmMwo4DyPGBJuf7L3cefR0tY/nuw8v7O6Ga3F0TrsJY60mWdqP4qag0Q1ebx9oaXmupG7Z782nA28/r8ucUvlF+Afmd8ZzwKwcuxkm8vB4y2w7cipHdTjBebVB9mLhvyx0so+bQe1pSjxLisKNenDrFpbhohr/a6CAKOFJEBqCAmX17oFLGJ2thVoDQTZJYBamGSpTySiNIWMLL4sKDF4HEQ+2G2BwutZIbCuC0K6DpkZGCp4aTjaYSyW8rARqgmAJ0DSlL2reu3eFSWN4dMc9EzO6qhhw5EevMnJZef672BcvTRetWWaWKfY57O0ELXSX7g0Xq9/lZY0Tyrlc7QK0KJ87H3hmVaboUnnejtF5vgXulb5yfL/4oMBbwowLlbkpbAcm2CpozNk26S3LXZ+4WoISdbCH1g9DfGytSN9gFKlrwDJhd4e4M0JigBKQbTxy6zuFgrVNPITUJRZqZrVohHyKMtDS25hg84qVpDl4WPeTmd9yYRbKTkhtJR8AUko6A6aMhFb8jK3uwyA2Yij/VG0hvF7eMoTQTgE7w3V0ICcBR2iwZhtWaGYprZxQmoRWX7r4lwkOVqYka7bw314WBo5qPv1YhS5/jDxWtssIdvPdiuDAZJrXR1J6EHhtJCxVBc0ybuI7TLWJMPxlbno19I/2y/pE/EsptVV093UbWj8P2DTEVAiEUT+CvyF8m77vGieDBaATSasPzhb02njvAxAADKJ4SJyoc3Labg2ITHq69JQiOHN0DDM7q4LRn4EnDAEtcpU6HqrGWqiirpaOeOvbCLheAoQ9VULccZ7rR7MAIboxG5KYWEMciGx4Nj052utkM7I83zCCe8busprxtze84WBuge/aU7TGRgfSzo8AgEpR1WT0429QbWNVjlGRUPlOFlxlOFy5em4aqLqUMATgYXEmiOsk/J3JvVlSAFOXB6UlVc/QeOnFoESxoxdZTjZvQZhj3571XKv9f1VD5Z+6f/4pIu3FgY/2KNLxEaMGk3KuidBhv3jhXJxM3zosANv1O9XJY82GC5qBiQBjTZBCRCKZwF7wd/VCZBSUrYCW5tblwwqJJK7melkIKAyVKXPhCS9L1ZQayVOazTHm4rVLIqGEIgHoyoisgGiGTRB8JGQKp30MPo4OJOW9jN9KBxXuax10IgOPIs5ZLWjIsd+sY0cQw5TSwTcXxdE15yIfacUx2bVnWaDA4sgmujCB3V+RXZEmDpAJ7CJUzpIcsdaV4PhyFBsA/4mLcc7rYzE13xVXD+QYbbKnOx+HFV4g6pmulAQSxXP7rfWzOJBjuWejT/2rdK/qpzxY7ZilGlYmxjF2BzfLsBUHK7QeSyAWl65BuT5DG5R60HIsfV2O/PsIDsgRlxkOvQoCBIojS7jiAmPPo2g1Refs4QLYFe9pDEASkGFhjSi6DPNttan+HTKvXPKmAlPHK6lq+Y33ZvqKFTUSmwyEorHrRYhL1yohMqbOY4neLz85aQRbLLpgL7jvZX0zr+hkb15slBr7hBpcDMPRcd7OlGs4h6o36p7s1fCOzl8Ypg2aZ/dK+sP5nHbLs3lEMhJE0J/d+4dx18X6ExKttCPK1k1GU3BA2drsOI8759UxJWkzXnPh2JrsgmZRKeqgCQMyTAiR1MHVTN22MScBV9FGQA6bsW5KOIlR0IL1NDJOMLoA9UHo1R6Xjx6M+TJLum8bGepuBIgaMoYbbumlbV7yzvw6PCOjEdKb0oiXTLngNZqdg20w6wHsJlIKYt4UGX4GL7aW0e7JxZOjo+Rl+XzReASn20esRPW7SPATU+LcPQhIIbh+4A3lbQEmZCLSG9OrmYLNYP7HDgGT0XeLdYu5ZTWZCC53J+iSEwMX0XDdcb+4tRiPPOnFVhrid51l2cETTygmuvDI7oIAA+lAk8RkcAYdQ1h0MdUxupgBaM2gAj4wToEC/BxBbqY8kRgFPb4M8Uw7ZgM6Bft87Iezqep+jHVYlXgcHrBrTMqxxaa2qf1PDjrz5tfXCT7P5FdSyIttApVQ5XPGWNVemF9G1ExUMdY+aVXpq7EXZiamIGDkttlYdPeC7LsYxQPV8LX9DAGjAwf9XgNxjmyYuaqnyS7RnEGqlwrDJ3h8KG4HJeErs4jXGXhzso8WR9nzyuHbiWTN2e7jTIFKAkj1HWTCDlVDw4OHP73UzN1e7Nx6390AI4tjVql+BZAVNQVDRhwHMtQHqQQFCW8ekIOA2h9HUR0ICeKKnB0YYUUzFBBB9uNyAg0g8mCAAe7xuQtj1IDJeVQ2ohBEHVh7QEHbUTUVbN4ImLNX5ZN3y/kvtZuw4daUjVJZGNqgQt5hO1Ee38AoEs6hF4Smkx6wWLk0jc3igNqCOEZsma2FSp6D2Qa58Yw7KGOzGJvcjsdegGgIqWAmJ8IphHXC78ubFTTgnnDdqlewMVFM9MUjY9WZcB7s/WAzlKgIEBAyYZQONcs7DL+5/6rfPe/O0qbszJU2ggGJ9WEHRSbppgGEFTER8EGpxo1Vyehg8AijoUEfY9+yhB2KmXXkULTUVGMECFAQ8PQwjYDQtmyiosDAEsEzSuuMUa3GVg/FobPbGcLMDT9kv494HdNZtB2w08cRGtFKWvQJ7VOcy24pPUtNsSZuyg9CDSCosjSxR1IOoc4UKk2MJfPCKHD6Z4A9EgwZyD6x7Suux2QQQCUQDyBQCtHjs3A3BvlAkkPHGkr4Q1RVwF1cPlCtNzUPK3vMq7TwZlGrSvq7Gcu6TNy/38q/u8444efx2krmBgm4Mw7EcXVUCpCyeiJSmAqAAhj4EGHOxG0O5qMebpI1HxtKY3EYDwRG7ARl5mAVRMAEFhWyqDQcoELNlqdkfDge5QYXdvMyv4oukrcod7x3XhSqtWe3QG8dkKmaWGltz7GuqmZZmWu2b29kGu3Rm6UhwapwsISQdAVPQ8aQSX3Ztswkuek//9XurSd+og9y9F0Ebh4jqIThFVYdk/P614J0Xrhb52+TV4on2YxP6e1CZrgBJDU2WSh8hlWZ8uyMk4ISU+kK7eWpvnWXHK1+8z8e/O+3W+7tN38iN04k1bqyqYd71XSUE76shFePM+wxEsiKWlYcwwLLHERgTsO/30IM4dmPKI2QHTFmoERyIYI5H4+ahGGfqORqBGaNVrLuhC2HX02PZXLqilamqfOC0w7ban9GmImhNLjXhTCIckfNN2Gqeb8o0+VRLalwMxnPJemdVVS8IceHiSbiWJQI2xHmbga9UcuQKdqrXd38B07eHoIRv3A1PA6wTXG2y9ok27TydgWFnRlvRu8a5cs6uKcwlBkxoYK8CTQnkTPtQqfnZaEp2Sl5tWG4HgwDQrJioVLs3jrx+xecf73X7/cm9qzfQirYMBtXABsZWZGXsPVUFkzLLDuSZZU4FKn26eZYeXII73PyODNSRnv1+NoPf4SiPko3IDXiUGHM8q7g5dkMzxpxNHwYBzukZWJ5BDtlEcqhCCLvv7kiS76py9F+drdMso4w4368S885os91o4Pq6xY+/6kMadIlR27FVrcgoVpSQa7Typnpy+0G+pVXtTi6DuAU3iljMgQCUJPqktTR+aObyRmW7uwS+WIBfVzRw/pniV7jV+vuGgB8q1992QHovA/efeHuM4Nbhr+XNzff90ScBDsKodgATYGJLkhQrOyjd9a9WmBNaEjFTYzSoMc2/dv2yDzze691PJ7avdLFf07jqBG25lRUbwoeAh3EmkrFDgBqQAYGcHogAc5CwDTVpr+Me7EbUHi0FsOEWd02WOYNbVnFIgkl2HNMHNxpi2cg5esaypCxACLsC2eZN2TGr9VhzkOV8vtnmV7ww6K+nNC4RP1hT4bGKWVdjx8kSqxQlXT5wkVOXsy7t61xLFMrdOtGLclMyhlDEownoChlfoTbDYJamj9MAz6dv6AHy3PNHTryNddgHEOMAkS1IGTPggBcHjsS1sKc5jeHPrtpOJUEYEsyCSlCLrmUvkALLPMskCmUTY/fn33z50l86nnb7+1Pmphm1sYXeJZ4geIRFE8DImAHYQWl6ehBNNSCxvBvm6ZGSgY9gOFDzDIhoJANjgGpEeQhHi65jwkxyTn5FKFfg0Cew9dTVNR13acZVSzYG2r6OnW+ETuVao1OA8Ils6GjuHBt41GLrGqWUUacdinJ68+lVeqvey/tUwyP9RFScIDoVbzgNHwPnOz369mDSN/gf5B/7FwogQ9uskNcZIvZQMsnIuBoVZr6VP84DU22m8+buus6RchtkZipYxbZAyUSdYFxprOUnaXd15s37/LPLxqvenrYjaq1mQplyjUHBMakSuj4NMBERSKggKAcQ7AAq6KUJ4BHLI3Vchjgqj5YVUAAFfBOsQrwBUFGabg9DRBUEz3ljHa3XqTMFZU3qa/qMtentrNeL1rF17Spq1LOJx0+wcGTNSDS+zHiYbr2Bs+CAyOT6T7o2pNWYWkHlNJ+26ZzJt+KCYkylCfMUopWLRWULl+B7Kt/wAy4FkDUiRwAMWTZjjvJ9qaEQEM4bxBs6tIkpJvSCvGnz2FInjoHQPKKjZNZG2eRx0Cgappq4ITaCSdYHdy/36al+7vu7XOjZ1myM6rgfXDa5fJ2uEhYFj9BUBzA4GOASBNIlOWDuBmnfsm9DNqaPlIDUglArbrhl1E1xwNTN04MTYESzaU4R2ANlXcC043pI1aSvOeus68zCZmxbHvPL5/WOpnXS8WQcAXTXjc1UzijruIGyvGbTNjnf3mrt7RrlWFmQdV922DG7n0OFdIVRUUBR/3ZO2zEp46d5UeMngJcO0GrUrbDuY7bastAxkAzSLF5M+kBUIAZLU57Bo60OkKvHlBdYqSTSGjgrmIsjqllGClNTdPmkX2/2r/j3y7bq492vzg2da1NiMGkJFnsrajFbDXhDhVEGKKSGguVMpXeHp/kgOV1KAgKieVbpCS30PArPNLMmUMQEFDTxoIVm9EOCK6Df9y5ILNicWx7P1mPNT2aZWa/KVPXf8defzi9j/vidSRrV67QsWD3SYVgbvczNpNJ8rIV0JJkb6bUholLPXs91Azugrceb32XrXbRx0LGgaQvyNdjE3w7+PT8QBO+pQNfaXKeTrOg2JZSAosNGTsUynOEmcucZAR7kE3w3NLK7jUCs1eqgkO5XLFyEZiupIQQC2lIjmQxOtvw2jG0GCsMCwHRdIrPd9qVqk50KCHYh0PUsqTB+5JFMyEYZUGZ6gfYA3JXmAPQI6DmbPqoCDgCiBqCAGg+jQxzSNKYoIodEooaYFWPmPgEx9ZU4FJ+RUJOrIX/tsvcLdyJ3Q5APcgUwBwxt2uvIwnUV3FRwMy8wCMb2D03NYUWaoQlMHIFWt7UTPBIV+AY2CngisZSJFpkF7ICv8PrwvQDRM9IxiQDoAFWADd2NRbgWXHMMosG8mGgKUUA3AmZExfzw6d5llQ4mn18RnEbazyqHrtvhC+HQmNicjO4Hl/KzOrLQFQTF7doeMzl7yPgCQrkuzYoM0MBlXorslgzcKONSlV0OpaWZBHPEeEStILQOACce5qwEAjl0KZEKE6KKLyLlpGakHYvETafCyF2Tv5ncKtv8rPet2W9mK2SibSPL5gfzu6bObU5/ygjDTCp78rEsfohswZVMRM73EKJp1OaF+zA8C3gCCSu8TpTgACnApi/2EvZNEPN/c9LvsjPDBK6EJCacmdc056d7FafYM7vljBG/zBDqZNj4klxOOg5a4JeCPczSOYJcFN46PoBbryom9hGQTNWfJUGz1NYiDeqwvr5vsoQTEe+chzI7mOGcH9llHGZW6uzzCRhgoI6FK7ux1/EmPZpqZoi6nxr76UEUGchSJVzh/CK5VLM+rU3umZ6bE0apd2phqSntue5f0726K3zfPZU1+dZyR4B2y6KcRe/HRKnexTMNjEnEYnR8zh0hnZqDDkfMuVZBqnJBpLAJmHK7jnGGjtoyDXK5PkrEs+Z14ySYAq6dFXWUdwAbv92m1grmRiKEXWMqIFxzDn3lTua3olmzJbCts06wH/PmzJ9JISaGIwECikhQpEaRQLZg/PsHr/bHBu0AdDtZAjTV2JcrrrhC2CA40VVCe/UWqmaFwW1E/GiEZAezUvxIFJAMWJsDz9h1oQBMw9QHHU6EcIfOYfrIKr9HPtj0ojEbudSiSUaZ4WSJjDYKlWBknlUOHRK55dGHr3j0J3An0x35jyNNw492y5xG89f7BWW/CAnB3TQ23t67625aQhyw+iej3E0IQk0tXOEEs3NjaRb/wr+mFg/spTZgFFQ2JFBSEaezRGcLrQ1ky3fIPWLBnnsdCb4ZYFO8HzaHnqMugfk+FIpN6shv8TNFYTKLf/chIYCw4lRhNgr45qyKeBI0MGTjjxsvvbkZIUA6OQNIDzlxSgHo7sH9/gQMfz89w49rpyAgjDAg8ANhwARliZKqRf0KJ8VIyMosIzuY4a8UAWJ+6hwcDIhEcoapAYT2q8g4W+ehDCflkXV8LhqVB5k5D+zP2qWUmTQruQafCYfIjCClGJk5TXNtuTKXBCCol2aL7ZnGLV5JY3dp6Ktd4fKEJBqlwkpzTT/2cC5GR0y46JpIacb91lFCBKJW28yJidRugSEDJSCzd2XD5zkGowAIhY9IF0XzHC4XQF3ZBF1nM/eoWkCYEFyoOEjkz/IQNgGFmcHCKVHEb/U5Jmfm0oyqYBgCQIhEFDbSFvpXdwXBfkZilLkaGB0IkfJDUvUM704mhjccRouYxccoQbzCBNOOY8Z7fc7iqgLJfJZ5vGuC65UrNK9EZQWqNDOyWrOk7GtTjtYn5ZG1g0UFpktziBNcRoG7MkK+mSdn8SEyc6gpTJIoBIqpRw2ktJvFWOrhih4P2bvD0CfgXEstXKreNQqDhlKBUxItXLCcRL2zITrtxa07ZtFIMg5+WY2m01zSmaExazOreACJlhAB+5yyMQe1phtdBle415kACVppClM4NLlw5uHOWd9GKyyTS7VMxnxT1bgn8fGARhHbRlDJ9ztq4XqeF2udtJJGKpXaCAjRTGOBZPKfXYx83XnaGAxDSiu3SdLuxu3BRDtyoej4gQkBOBwCSyC0HniQXUo1cQqPsldK+7S/HMgs9AACjovrSmhSqqBApBLU5ibbDBCkNCWOIUCBJoqb2En2ixUfunqx1jFaZRfSqMSeaO16Xu2EpRDD3tlWWwhNN1fJJXG7JddE6/OeYxHam7Aql+BVSCA+GCoquPZIS4SIlHASrzvB6zFpiWRjbyyEoRpBiTdBRVCb14odYBMQoekKbK4+MRwYQk2pIGhKM7bq4ZyXZ2uelhw3QTEmkQALIDXrVoTRN48u/LWb0e1mDjGshCIoqs1ORViUo4OXEFwTShERT+YPZgLt7DnEQ1xBXrTikHdAKFMLWkvkmkfa0clRG0yhnS7FDXJAyqxNeXEKIjIqVaJKuezLCkbajRTZLcn2lUJJuZs08q4Z/YasKgoUlAlwvYSjIw/GbHfMxwNZhXdRksxMea8WjsIeRHxqMIZZNCNVhKtREOr1kMIIozmgMIOkCawLREoHrdFlPCSvQ8EFIEVAC+2pUUCNk/tobtYAdIEFzIqFvQt7pQUYzrhTe5wpDW5jZ1czDE6J50Jnu7Wvb7LJzJZN88m6wowAwmzq/mLz5zR8ffDCaBIT2uYUgQiSWGwsLSWMx0eVcG0zvPcekZHkUoiMoqLRQWmVTEa4Z7F82YJVTY+04rOZQz4YhJb5Lj/hMkvaTiid4yBksksuK31l5FcastTu+sWrmg0/joOHerMbfbsZ+Z2QfeeeZdAkYaP2kvknA/U6dj0bZZ5PggUxDgsI5jsTlNMB7KFIZqPRu9fvQxqzVLKacAGSbB5EznwqgC52KlJIzCtwGFiX16WTYNMCWgNaIXigQhBqFbIVhh2mE8F2FG4yLIyEMw0EKH0zKb5x1kZH0aDYLDUoIMUmvXh2zo8b4MZjieVQvORP1hQ70snm3zjb+v3GHQmLwzAMUiKECAMim14B4FMT6gMVi533Phec9z4bTQUQQFaWYc20gC01gxUCDPRRVV5lFGCCPZdZ0M5KACGD0u8SXD5DBhKER46wKAnmHh10Q78EmpxxN3R5GH4zWNdn6KQNpHZg1vcBkwakXXbYj3eidSOrpDlGk7mhWSDS5koPVfwYXDNiEEDlviazBFMBfTW0vBuJREFDpZEKC9BasAM+1XmdCk4D9GK0SedaOLAgOoIo4BajHYYI1ixYG+mFCSYISvyQ9kP2L+k4YVJoZI9ZxgALtPEXE+c3P/1mqTl7+9JCdxdgsfnX3rvgt4I7fNI8gZCpMhOGi/pKdHQqFjkQEBEBRMS4qBlAmVh2rhCs8chaAJSF0yU4yFhSAA9Ohkv4hBKhSOAbAzJtmQs4oIggpvEEuV2a+G6x+deKh8QhZA2bXLPiA0CDAM3tGofDfnknuh4FAX52d3ulvUOnkDxlpffFqZv2SceCpeOqkuVEKuy7j73jmhhb/Fwbr2ldgdSBt4WvW8EfCtAl4SKqs1ay1HDMaSshsX0mwGENZu2kq4x6zmy7k0mB8a/NY44aDZDEVHbqHu77567UowOIFittE87GAKnagMzwlVf9n7sHvNugnzE6AvkSKGUyKUiuPZ6GIjvellI8j3aBCOSYbamvhu4RsfyoCqLyYIs2MMoWOWFxv2LJInPBE6YZJezKnaY6FzVEIGT4/WHLb5nxjy6QZdfMWxFkZftcTWOYcro0+PqucN+TWmzo7IeCA7aqTDIntYPSx47OzAZoEaaQ4EoFqxCtyAKcELb3/XDoivaGpJI6XIP7HTjkB7AA3dsVMjVktZLIYwlqCaeYUiDDbCrCGITZ7AW6s7hRzKjK2OeF5wBMnfDI7QFFur6jFlebnrt8DF6AJ2BAFJSPIAsgHLL0YNufPXHeD+P3LyCAI7WLxJIaabxGueLGl6pAYoyjT9WiQkAm/WpRv1ogOR4yrM7AwYIaS1aBrxxvnQAeXa+AvGC6DN8u/QgBvNC0glYTca8nTRVhRQPMipF5CqiU9hJNdpvG34exN5JWh+pCxbJv1jd7tAygc+XOfXVjn22s1DEmTRUT2PTULBu4Y6/2KJJm0jQfwLxZuPB6IH1AEVrF4uR+iBPEEtIRCoNLCZ6twcsJYGAL1tSxUlBLThcwX7KkdsUZxJysghbhBrJ3Rm/FzwDBHi4w8jHkdmc6nIYxsSFIt2t5k8lwr7/EjOgzNpiiKMWHkpGy0j0Q//a93Zcu+eQsp8kVVca3oiXfWcUI4+XxGKxQOJ+tZ6NORb/f71dMIFkgPrfIiorPAdGBganNOYqORn5UlXkOELVlSW8xpMwKfxDH4iHDRShBbkBwkrWjUDpNEb6YRyski4VIj3oEmEy/tp7D0Lsw8vEq+3vpyUhJDs0LmjSn76x4Gc74c0vfC7F6QS4m2q3WViDcpMoPk9qbUDsHtGR4nyxYqCZcCFOSU79dwoa+e6AbLtMC8Pm/C0p/0g90QQkoQohSpQulm4u9tESQyLHdpobw1SBzG7IrZaiu8CGm0c/TyNegAYF0rheZ+fDURXjZv4h6Hwx5Toc0qBlUGLBwQgH243338v9tuuiTZ+50mK0iXq18hI8WVpDI1tCY2tRWv+81QkYWUt1UVRV3WgOEVczkCHlOLBK5iTCxcFssQFJGH1VFIuCHqBeIRFeUfCUKlVeWJVgboIIiTbByOnbt0ZUuhpXjK1pljkA1cx3CeL6Y2E5j35cLfu0u+01DoucjZGm/uakMUW5wseh9WNb96IW9SOiy/S9/zkhTAXVIL0XxCLW3C/YR2AxQl2evHJ6BuZpw1RDJuzQVoZYCohYhxxa0jtuL90L9qPADX/D2lswoWBHtwzjVoIQ5L1JIO9p0vllsgykV5e5uxdDN3sLo24AwIEGJmT6yokjXad2kX1+d8edLAQORqgxqlyQMTlmCVH207U/8yKv933DSBdgyeqVi7CEy84LKGgMfQiDJnYUC9CvoL2rVJKKRpmOY0zpBUBQcHdMjKnBEic6FndYCcUX7IFRDgCIlSVZ8mFK44eS4NkEaLQhLs9ETml/xrcOXcuHHtPm3H3i3Uv2dslHZT4IZZuOh0QjrfjSt+31DpltQNoAC5nZs8v6HTC4k/n6u8p7YMbPR2fQJBAsW3kzCK7jkJ0cERcIDDsCngk8kuxVYJrhf7/QDYdAp8kLNtrpw1jXUJjAOAWqFc6z9c8q1C7cje5WsSEvt8o9q2zcFR4eVigBjCPRWT2WWntYNnKZNP06FdFPg5LEUgwhIcg+RkM5Co95/pT57uPuNj5vGR62lrByv+XFcNaWTHfRJh2oplUPMiEJccQAQVVonhtCto3p0CGr6iCrDSmLmwhnAII6gzeIhQ/BihTRZsSJtyFvBOqoUpPmdNmdkRVwjZ5iGv95t/a1nuU8A0ZWJZjtTKo2ZXdd1PHbrH9/1P6N074gujrfPbZ9wuNrBVd+R6gFsgrZmrwkTLJqwI8GKhAvWARFUJIg18WOF+g8Zmi8dXQ0epR8gg6yLoZOy6oH0Aey/qNABoN7KXOtDzEQv0wd7GayFgyQoeZYzuC1/umR3zWdbY4SgaRAlZQ2m8nfY+OPEpztHQqDXgVJAUrvxVLvabrht9/GM6z6edi5nWvN1uZH7VrYGFCGnb80sUtwu2pKxBkugBpaolHM+wHsAoTKAHdcFwAGS8ojacMiHaI2J/dRmDUA9BdkioCogSSjbWUmGFXXKu5UkMHWkGPMWYzdm5J3Z9juL/F0RORoSxdeC0hHflWQevtrw+yF1Nlltg0FRjGyKsy3bVO0E/W9I9WmEiUkhc1xDsDVmbcIlM4vwKQ8NkejRvpCk34eXbxmNFckBXgs/YAboQCkdyxOX+Q6QltBK4WbXvSc3WX1KHyd1YtSaFIpWYUt6chd9RBOXxg3jAaqlOCbI7Xuh2bzXf83qPn9hyeadw6QJnKR5/PgRoNz15NE5S9KzD1suupw4MdWD32GFujF5XhV5n8saCtYzK/ixXwLUAPKGCFkBZQLiuQrUkUfdgnR0X/8gNkLLRKuQYzbaZbTE4hSQEfHNVhiEnGqMNA99XDDn3NMlnwyX/LHD8K+v7PqF+Eng0JUw/p1q0Bx7M/hKzvzz79Lr1CIzaC4WFB3CKHohtQ+s+k7ZxwVNMWWqC/osvA7By4Z3QUqPZittwh2FCw1pGcuj7PzyLOAgwIYfSIOndch8kZW0LspakQEU7b0hSrWp0prwYeg9mdJHARpAL6rK33Pko93Wjw9YJpBINV6pzjUIDhY/917+jWEivXIsaUtcw/6SBpQQQZFHekbLecfz7je/n5n05vGuJNfOveSRnHfwC8iv7x33x94amFB/oE4GWk8RQTkQydEIQBVVeeRVFaLNmpBcvZcFQUPL4vcOUds8S7e6SUpBiEMHTOKoxfjMAKQgBOSevPk9XPzJ8KA/NehrM0kQgLDSrpJWASUO2OPA/O3v/ecdrCc/UPlsDgJIEKPKnEbxZHI7Wvut6P//pHp0CmgAC2SXVXi7F92brxKLgUKpIMdJrP8wiBZkXNKzBk+bFUDrB9RA420CiY3DlabOFVsBHgHKOQDjBttD+mynXrxRp4eMHlExpAbHxtktLvqdYXvTFOeMQRgFY3vRR5t1f3iAk5/jaLyabr9dU4La8Y6FWV284GzbMOm7XvP7Db0+2+bxrFDiONdQCcE3pEnYO9ZWwBpokWVVaBoqMUdO5AKvYXzEBVt+eFaEEwhLZrK1IeBBMg/OddudgADeGei99IJPILstm3/vaui3m/xvnZEWgJB0d4PJ3MoRLedhpXnRd5bO/Cu/03MOPX1HSYpIJ2EwDZFydyn/hirfddyl+SGZEEUTvSCZF5NgOQhunIGdszikkj7gtZAOldMzdKvlMcdde/PfnRV+gD15m29W5U5ltRJKTemRmrvFySpTsDHpRZe6OPQcETQ3iolRZlQx5/8xmXhr9LjzFDTKnDE7V5Bmbe/u+8Pwfv5DP3Gh/oyXwCM1OdJNNmKv80mUNVNenHnkcq/rnk/aefwxmfBlieyWMNDmPtEwr4ypBQ2sKU2GCYYJQGnNyIoDlong2CMu3Wi8DcmYxHCWzJGLOtx0EhGrBSv7CvIWTK6dWCLrdHJTM/QVZD+m8/6HN3q/kj1Is7tbqmnBDQvgpaCbc//oi4EXpa+/QDqQEF2tyhRTzw80/NaNvpHCzQttgpqcYcLln29lXrrs8yyMBCSQxMTiJwLkVKxC8oXz86srffx67PQD76t8+nwLch3q8JjRz5xlC6KLuT2/LzBRZnpXpveEeh9MqVXB5E5oQqHS0C+HzZ8Ubi6YsCcuIeTQn1cJjNdN7/0/cRj4aXDqJmAVBtwweZtp54hYcn6we9hrj6de+7RhYjqxN5eFViop8dpyrGucXdvmiKwfYQrF1vRMoCyMrDhkiKxyNip3bcwfYYXE+t86P95u53o0p3U/gQK2YFgtstConDzLcesKqUYhDWCa0iWknkCpP3JJmz9Or/bfNdkvOx0NgggEEToJCx5HVTyIlnhVBj+Ec//Woe+isdoFQVQYVprposi8Xn4rE1/A5l/t8pMA0x6V4Q3I7STziuXuVbhxLEiBEo1oUy61hnnk0AZILZoWxQPWAAbi4BMBrAU2c8QRmxwRbUGsQWz+hx9+A2Wp1tD7BNIXkD4G1dLHsagIuffN/f7bA0zw0wMCsqzETaBDOiBpu+PTT977v1vGG2CkOS1NjKETVjp+iSJyk9p59mpmepx6xfczI1O9xUsrtLVuhcL3V7t5CBNrTQLw/vFuN823TEwL1A9uK2NODhlibeZASY+sLCjyoV2nmQR9XBWY5rtME4Api6vhELjO7YtCTiCSTGK93WU15waNjkQROwa+7xOnV/zM7dCvCU3vEA0a7CN3ALnJN0zzV0U2OYZz/qhZ85Pv9BwnK7vdZAZpEhYIKnnFZDcwcjkVvnzg7BuuBo3e+8IGwlsVbKrgFqQkD2H2TAQ1FJVO0lPpoxRcgFZ3Xa26a/zw5RiQeYDcCU7LgNdKjTIC8F8Y/AdALoEse4FI9IhfqX16SD3Y9T6n1FJsSwRAGW/rzv/TafiLJgEBi8rtKpEIYkdJgTL47PRfHNIvP9uGaVasWZU7uv+69WGsaI1miVpPd7/iqT65zo3sZuTV3voRA0EJUUBb4eZJlDEZenQX0tkmaFEIZQIGYMLQIKzQKBZgaolH2MlxX++PW5rTHvZcsGIClImsSMaYcW/81EuMybjzrCjbWa+fX+Xx9gp/VOd/4+WeqLIgsW9uKIJBHm7wQzrjj36WeWxUIyCzEhCIZKI5jaawuRn9dhr/Vcne7WDukCsy+a11PSP5eycbsmkPLZTggTeAfkDKH4qppFsDPMCZST9QB+8PwN3XbOn9cyR78ekMrT+1t49QYDQquVRjeh4eMs82qeNE2dXAAkm2fSznf+T03LFIA4LAoExEFCs1vWdnL/HnHl72b4cH7tfG/u0bexWs2qUFsfjVc97kfCtPuuix3s6Z9u7GK61ZBStPikko1xspTELC1qgrlAlCYZqAYcKBlZFXwSYecQtZ7XRlLDldxLmYwku35W9N85SxS3XSK5QPbMa5J/GgR+K+X6j7f+66ceKmriAIV5iZDcTf/kW4claT7v0XlE1/yYt1Z2LnBk32zIm05W9YuO1GP04jXzp3OzETaLo+3QX7SQo/mWRfgPRKJWjkDEQBaE6iNZR7gR68F+kdNVitwdP0A/naoA0gV4T3cw/9QrPPtXrvPSIVe8lNrfdB0/My9TwOmTO6QgVQJY2Uv1o88L8/jH/jvJrkFMogZRJIb/C5/vnsi80JE/MrPYyLFvcbvVhgwDO663L8gA1EhGluz3lTJ2x/npl/qHe5oTW79lXlM8ixwuoTqqGuu2ueVCEf2M63TBOEwsBPhqkGHg8QUR5pO2TTDx7zdRZOoX3BRSeWmkBhidgb8XKsvPqY+DvstWSI3rMuOjXd/5nTQ+5tr/zXfftLnx3bndwTHtICLdIqnsqCh5B+Es75y+4GHr+wV2eaZqVIENMsQiRdFluuy7ZPZezNnTPAnimVjX3RpJ9L5rRkr1i0UgxOBDubUCvQAGAJ6b7kyanl9OKl/affVb+4f+cb6Qf0k4XptwLwtPXsyxnjcorRbiOy1eqVlmd15iO02pQ5HXofhp4z6l0Vy4gtXKELXfD/wrY3uz/4DV+QgOgIwa0Qi+WmkZvt9K2LfOiTL2fqqYb9WuYrm6VEnTLACNtXr889Hfe87qx6T5vG5pmKN1TGLPIikv1BRxW2KiFseG99KFXlozoBJgAhAquIy6MsQWJ+v9/GDEgLE+DAtkDXs5JYSqy51umlh1I3WjdoZeh1hg51lGN+sz/8xXzAg/3+X5ge8A/z5v6ulq0GX1NJ7aUjD33o5/ouuTcbf99u48+/k3ny6HvyxgjDIDGxFrhw2Zuh8Dvd1o9o/G3DI3TQC3Ypcz6kHt31PjU9q8UZP4cSsc1ZC0cKJZ9YZKlxeFg7rurr/PRDxaQf6A+s/7kW8MtrBx8vLJ1mCtEH2XOAegGBDslEIEnMn2b6bOh5sktdDJn1ic4BFJ6lDIY/k/v/72AN3Z2TAbAg3bQkb6NbYXU8ddf1e/5imtWbGVSDmQFKKC7JZRSBurT15LJp8vE+N42fab011aO8heuHZKKsDD+9UaSuPbluRG089jtaBQSiZuPRtnCg355l5aHVUFwb4LQ6zYSsFHKDi2sxMM7jOHXHj9x8/kne737f94vxwD+/izZvDPFYE/RHBSFdDOJw3weHru/59BJ/x6bn9aGnKYqg2MXt7d3OUT3Q2CFt/m4Y/epQuJs8CEUz27ssqXNKPyrWRbJOCLOICCX5fwt+F8jbSued0EnXhc07Ftf80ccaPwgIQAJ83Yv3c9t+7QTg/46OpwA1YnDLgL17FUx6dZJ+GAZevfgB26lBmQZE4VJe4b+hrTdOW+MzHEri+qy75HVUByeOo9a0l3mgThi+XF0/unpg/aqbreGSGv2+T2PDrvenX/QwV00z3eh48qTjOdFpP1AFKkpI+52vSwsIgAA5PsISmn2P4v26ONYA+m0P0AMcL1KdmKST3Hvv80s0WpELl5cHPLU96KvLy/93zJ+5no3l9WphLU6w4pAjzVQeqhney79tc8af92f6jhegFeAC5EhNeF35GkbjDjDy9W7rr8LENwSzQQSwyW6bvg+avldT6pTSq+5H/v8HKKcodB8V4dsR8z/K5Et3wu5tF2DX7vSDggAE4H8PwNsG+e4c9f7YxbvbjPWUaTXIHNl+s9Wa3ufS92EY/DD1nRVqzEdw6u6JL5uX/88Dx8ILBxjEj6vSJiIUpS8aHk/b/dnOM+3+T9WWmA3S1t4bbKBnXVMjHnlqPa5f8d7rTds3NfVBadnU22mglJGoGvSrg6DpI5ttQpqv399dY1WILKsR0YBs/khLANtkhS9XC5HMtm8sK+FNDvlOivd0Jp1bYh39gtW6372nRz312Sv+SVz00tWHjo2aDj3V32jTdzYcz/o5uJJ7/SVPNvzl37IfU6pz5AtS2L+TUJrAEHsRRr/fbfv11fCvlcJuupbNTWf6lHm8y7w69D9yfcsHbJVkgkE6RNEKTjUsp1A5CdoLx+uecPrWAQ0/SHg14NsW4In4sHBwuY0RDSLPfv0mABYISaWu52jKPIKe54f08yG9gDtaGo7G5pX/82nrLxuH8KUxpTrhVhWwglYarVvrU837+z9e21f2c0x771QFo7g6qiSUopYxN7w+93g+742THv9+oc7ZscWaxrrsxwMTpY+/V6U5OubelokZ2OAm9ggLB6LrHHW5Zmb/x7kr275n2/fbLbOlZzsf2PZpXmmEiTAyygiyXzdQwQ+8fWV5xDOnR72KV/jTdub9L/XW8r+ePKkyWUqM7EbjvTbbE1ylgUf0on/PdwZ+Cj8SdreE1uyvAyX8bHiC7GW37Sva+svdyPXukcQBarG78GvpPU+Z0yZ15qhNSi22AxX73r6GnABaO8oy7fp175Xmy/4vxzVA+sFDw2cD/JjOlk1oXE2kXd4A/jHIg25UNJgSI/4SW4KdWTJAvFe1h+Y1uV829h6mUxJsm6s+m5OuEZMOUkIQ1CBCoHNj5dKfp7XNySttJ+v2ZMctpdpt3WLtHxdNLWXLg6GJTns49Hc7RWMDwEq7Fs/FbSaElUSMMSb8M4tI0vXbImEcSk0g46CXT6jK4TK5BrLrvDUAzw2kaZIAKU2Xb1spTiHNylTU7j7ZMJOXJXcP2z79bPyzZyPfSf6z5iUgm/QCOHAqBgI8JTTDKitPLjrWWIt0rd+4cqVPzq2+JpFmgllJip++3ZyabSYW607u5O+Tk54gPitr5hSkQGZN8q9M9oXL3pDMWkmfUUSSEEqYLtjoEZP7xvzAuuhQcS46rnQ4OdKjV+VjiyFDSA5pax2qLoYa+1N62tTgp80chQYM04QgtHd2gPiUJA+scnTO7GxXgk6QHE3PJ8mqmwxxACOJA2EzT2GXZSuVQUvD9eK8q5Se3N5apRFRFJFiF2XUJBP33ZbJnLZ4Zp+SJaNglpQgQRNJkNTuhiYMQxAkp06dOrX/1KlabdrUJJwGR17mn1AVFrhrMBQg5RjSG0hJbgCfcAO3Jcu3ubEKgcL+tgGl7dNNgLRL7hAu/OzV6JevRj4+5C7hReLRubxSnA4uzZY0SkULgmvZJGfNS/75w3v9j0Lvy51sSwSFUIyESlRkx7hPyapDWPtkjvt20vc9vMOqRCP53bs9yT1r8p+67tssUwoDWWgtAhmpygOT5dckT9+1ObZhji3hz5q9Yz7W2MVPAB5WMu96tmwHZH2Znh5nxhUEDZvTyxTCdWBbk5xYZc/KZ0gn2PMgprHKFMI+O+dVUc1uRdpAqbQRhBAGMJJeUl812/Zu8+6k55DiKECKfyBAIxBVSQRTM3zTjUTqvzjYy4PVrVIkNkgiWaqUYiYIG5lQjDGmnYjUNF1NREKA0ssnVOUAV3iAGJI0gRQIKSS4fFCRdjWhEQAlWmaajjt1F33+4qJffqfwiXhX4Rx190Kx+UorHUx8iKQJpuiDrfJs1r827+s/OqgPYdv4nkiYJMEsLhm9sDNxr/TSrHtiJ36l1n4p3lwXQCojkutI4bnqvoPsc4hukr+xTXP6zxHwEsFHKj4wPPd+Zn79ANU2/BN9LLKLbecK+jJdbCKudlX75yEMQDQ0RgAFoPg8aQqHq9LUTi7ZJW4MboYOxVxThbo57cFJ/0OaRAdSQoGpxpOrmJNXUw+cZ+7C9+IOq6c1ELA39m88jjQEuBsxER5svVz0HA+9T56pHlIJlghkutMS+kBKRCRJku5SGIb1L10mCcWYRb7MP6EqcKUhOQjxrT6CpGAFPGAxwHKMCSlboyuvbdeYdM1Vq3+Pzd/vLvzVH3LfTfzlkzO0OEtTBjfadm/Y9RmJozzvpmu3e9bYq6v39m8/2fRXXl10a8biozwezV547z0LQwqkaqpjdtIunPBmr28/Qmsk2ZkZm+y9CT8fRK9cZpMFRUhkDAUxSMGM5qVJ7onLTH1yAp47vXF+35mPUR7FrJDMPYoGaTcO4M0CREL0DBRDgoIE2OKgCVbLydeWHF18YXGGuziTam7fed10xnOX6gdSQMqXHiOgM32LCmMngLTpT3RxchdOhHtjBSHNLRKWi10mMAnZoAi0uPitwT69M2yD1Z5ZLgBKwhPLyVJMoNlZiWO5tAagSgkEc2Ee4KCXT+iqyEZlVhKsbTFHIQ1A4Z6RGCP0J7CaXWmgNLWLj5KJ+WzLV5+Mf/7C/e5u4hNZY2cvpinFz4CFTSCgq1EY5cBTAFJBc7wsL/ZXy8v8nQ8uufreRHkvr58oYNCcNixSbMYPxdPSSWd1wvfQ941LD2Qcqlghu2HdN5B7SbLbqlBZVBPTgBIgA9xBOodypS4XcDkV5XNwsEo44scsr8krxYnboWCkJpo2kXZ3G8SvgnoFxOWL9s2PsJAxm8FNRe0EycF8JzdfQVG23A7rX5TBh4a8rJBSrcYmSlKf9Yw4A/bhxdsuP548cIDMjqwZpCvSXSkhXTC3RLuL+/3eSs+Gnr/w9Kqne6B8aodMCJdCBBVjTfAlMCKJVum2u9JFS7iDnsXyCUkttmbGdDBewROIYYXw+uOORxtPfVJsoBXYDImwSra6iz//zshvfEMN723+6Fk/Ll5G0I8bxzY3PutxZOCpCMIw5eMABCfD2T8379e/IUPXNxPzB9n4sYKEkfaD0tDwAVjEWfQ9jY75enTC/zfFN0lq1tyfddO9JblPB4XnTeE5y6yEmc2IEpgRNJem0REov85Y/JAszmzJM/Di6hrxGj+IOQmwutKlFbaUkXI5crF+RiVP0JgSqj46T5iAEJG0d7FDeoB4J7IFtMke5oqns837cM4PT/ryDXpBShVEsWGjZaCgTcDd+Nrd54hedQfjl4vUBAgXt+PtBFgRmY6STHlv85erga7b9NO7PA+pDGSpGDdXwiBmQhTKpRjQFbksCwHkE6oSPA5nkYyAYkUANKUF8VcqYj3zxy3NNPASOIUu+uSTkc+/RncXm99QP+hlSH04aJY2O6BoVjzRJNOwCrIpmDn9g+b9/Fcv8q++tU3vjeNHcoD9GoAIJ5mw7d9yzcR7c/wRjv8qnPi2qFJAmVoZk66F6nrZdL+Crlchv5mLFh0pOU0SY06tkjC3Kl6LUQfT0eth+xHvZMafNAPvOgdoAAxyXjPf38V9lnaXFbndo/1zdEzIlHCUbUIx6nqjMXFzsCNxtgvn3nm1cQ3M9tGdU4QXfZG4CWQLDAEjJDEJAeET6pTkhzO8DvfOJy83dbnNwi6yP64IQE7tm1ta7c6punj5L86ckPv+PuC0+RX8rJOkfKJR6cYSXkoucwlvEc3FySek5EqAwc2iDChSCLHPHZ1rxzqrSjV6O5UYX1jvtn70Z0Z/deNuzMhvw1qs3su4snH1RaAFzWRm/WCWkX56EBvPn6ju7v3/N/876T/8nWG9N66PJtD4wpi0F2YJytJYMqsT5uTY35s58X+r2hPTdD+UiGQ71bV12R/v5T41XXdZfiUogDg0NIdgW0NagzzVmN23ZX4PPp7BF8tJP/j5DPo9lWlDmHa94bjcdgUPJVsN8bNfCEQBOOkIk8qg1OBUcff03cvvxDP5OABTaXg39ayaM84mnYcbCcAEgkjsowlKLEkvBjunNQgf+p688SRVDURZJRggaKdy98R1x4GFkdLRXfwVbdvsznp9Y3V3Co1yFzzGCJAaIhIS6OZ2u93tsqQFUjYj59WzqIBelqjkqO9IAuhSHnMEXcpjNgH9QqDInMTlzc4xRttWgFzZxWRVhWrO1GCNamkZlReuLWe+UtsPt5H3J0Mf/+A0vveSMaX44pkEAJs44CllCGp7FGF2HgZenr1v/6C519+/27IrY/iRCZ0sKySNoJnapIlJjyyUsnYix37XHPt/tkqPjq0xsKC5KKv8JmQ+C7mrqnCX5XthLGnMKaYkAiRAC5jfphf/14zLh3ReougCSgk24QdDn3l+fEevS1tQ0ndL5mYIxfMgdiGaPHZpLVQEbgiBRCzQh+Ted4ViCkqeUmPOG5uRIZz2+qz35KBkkAB0O7ptEl1Z0dm42UBOfWbOtEcXjDI+SLoIQcQAAQEgaLCbhJGACxVgTastX3/woK9S+lnKt5+5s+tNZ+QT06w8YZkARkRiWRCBoonCNLdQkEeHZMAuJUO2iwkoEEDM9o4jGciG6BIOMUeWdkDIUbJdhjiQPm8UlIYcda90ZQQLWsmQJM29rD91ubRmpemRp4tOtke+8HzOK9P9/94Pfuj6Pjp5sXApfgIGGtBmLxBm53FmaX42SOPSqIvyvv5zP/Eif9XVRds3w/HBBD5yEIChPLUACj5AvNKM3Molf/YHJ/yfpvhaJGK/9ZiBFa6Tnpeh8KrJfyzyazA1kZKDaFApPKEgPAd8BugB6/13wnzfEThdfSSTfnA04vW4NmhNK2tbh4K+nILxkyreo6eatj5ExRcz+enfoVPRk9GT8LYURuHZJBQJIhT2nVeH05+trL4Ap3YsIk2kABJoeoy72gy0Zg3PXn1bnP2JCpKHUVDSSE4AUzFUkQhA8yr77r38fXP2Q3C7N3m7SeWOjAgJjA4lJpY4Nt0YiwdNEHKgYATg5eL4U1z1Mry2KKILJLdEWvMKRfQiI2Ce3j6Sb8n51hXRRZHV4b18sEUOK4vkFcql+i2j6mWJA4kRME9vq6JZhvPSloKsHZdJrIWcA8qVHRdNWGHvE3b2+/kncc6B7bxD0/2/XA/62l6fvTuSxhu2VGUrnVkdsAowELCXXa60e3gv/+6LF/mbbi64fjVev5TTj+TRuNhJwBxmVopeUPZGNn/0g4t+8zvO3aF8rCSdZEOaXAfdt1Xhh3tdPwo9206uF0EltOR36gKpkVoXcgzpBZQqjXJT8rn7iKPjl3z+1OLFnr6THzx95nhPgFcKM6Oyvt62fTsG4z7xDwOabmkK0kOpQCNOTrqWQnHeDpyJfqc7Yl1ldCvYuPWPdip3xNAlkJlGipRaimBZ0YtdfxMcdefPUBgW6QqNU3u7+9rbCUIo5i88x9UNvz8Zu2/Sp9J3TNdZBMoUioTtOFxaYoJGFtPcAhYXNB3lOAu9LHIwPAKKg7UIaEsUWR1sQV411KM2oorEnBripm2GkE0vJiqAm6eLCOgSAliGKGBZ0DZAWDoiOEQVAHEgLYWDm2OK4OYGusgjimII2VTQizlRlxBQkYvlFonDAQLOlQzScSGS546sXDFwrbc33bfQvzr7eJ5/AI98Gvf/RnvYo00t7WqedcSzNUk6IDLN0FNpIaVgjTqCl/qbVy/5d6RL3n5jdHqSix/JA5pXhMzALDNA8Kp89Fu/2F34O18rvCvrluVsOYtiJVEn8i9c4QeT7A+q7pcmd0fCmojgQzy7pUQBKJ2633WsflE5OIYXR+Cdy+usfnoHkH4wdfIGvD9IKVDaCvPTljE9C8tVSb9MeyRLdTQFJPivYDK6GmdqnKFxDqDVAJx25x3cyPWhZ9VtPD9QCmCGzXWXlkjQDlaJjtyl2s0Zj8hOdPHbKbt3ih2BRBOKQPOYw0fatc6kNS22fiMP+NWjwu6NunhBq2SBrCS1p1STJFhiksUaQUyACDfBNYkIDZ0FfuQFBFAkA4aIooA4mAKSV+YsaQ2IhwYOQlPGmE1bIHGpzohKzKYXGEcQXSAOoFhSRSQrqSWTTQ9RF4GRM5EDUXEDPC1jDjZG9YRj2AiiC0i0pxFnRPQCHiPZFrmDZH9xXLHIQ+aQfknm9rYLKyh7rBGsTJCViTJ1qqGu3HesxzlHLo98rj/8kfkh9+Lcp5ef/KU1tduuMwo2EA0oQYCwGQIVuFBn7r34a8x78XfvtmxoBF8Yw8/kNWlMiGGOGRglLHI0+U0Zvhwu+K1vjP3Om97lyZk8bMAixRIk6Vq4373ns9D7yuXXWb70wugYZ5IImpHU0voTlf4QxKnk6lZ2/AHvi77/BZjV12/v7fxgK0B3TT7YSE6tq/vKcfs82L0AYfmOkDFAlS4rQ9VimfkENYqexd27wsZ5IG2AlCR3kKF7N/jkrPchWToUJ2uynQnTJHkCePmU8g2ctZq46y68oewGFJxB0FsBEhN8QQXpENNJiw1vHpz/zRdyQ+k9ueEGnm+1nYLUAwJ0K86CAc/co4wwKAbxGMgXuYN5kflylIO/x5ymAKGdxFfpmQG+ivlgNA8QNZQ6wHAiPmuJB5p5FfMhKuDRbjepxdlgni4iTjSy2N1c0gVMjGdpQb5rHNblhltRuw2dAjCczA8QdTjBcAIyzwADQyHpSudaC8tqAr8NdjQVbKU30TynBbYBEs4Gg8iN6XIxr+IBXRBZ8TwKUGQl4BcVVywalXCFlHEbKVwR7tTBeA1ytze8jVX7tkd1u3B5Ovf58dAXt0c+FQ/8/HzBm8uc974Ga2qVlm7lGYe6LGLCx+EQ6OzkvfqrH7zk31suuPqLRsuXJuLC0wVY8ABsBErAEghLCoMZ/n53yZc3w3/sj1nFnSU6Q2CzqDz1rLv8K+j5eKPwcdV1O9N9XZiOaMBf8J16mGugaZJ/Ij77Duvzt6jlEZjOHxAg/eDr88BfCfA9wBGwn6RaryC7R4hDRLyJzVpkBbMCKWiKuzgHZMGp6Fi5u+QW0uGqc2hddkvZyZ19EdKrBXIHJleBNX5MgluAMocO0JTxdnPa+co6Xrzi5WDdnRGkq1GkId3bZIkJSPe4mj24C796z719subB1Xi+gXaRSXDbKSDsKW6NuzZT9hATiLI0SghLuNKXXhx55uRs+Yo9s3E/CTnmiEqGqLBnzwnl9D1OJ1BrWRj1kKMCWLYAAzfUADe9iN/hN4C5eVrOAVNwA+xZgzTfgiKTnj4CptNwMkCH0zCcTgBGqwIDAxi2gYmprWleMXnyaDlbBtMFmmCACdCRG0wRckTbctRDxhZknhOzB1x5BSMEKDKcdyyWeJLHxUQ7rhNCvJx3uKxYe9a85vm6X3B0OvulOv9xPvS5uN+3+s5jvaa5RlyrQ2M3nWo08DVpTj5tWLuX/lvfedm/eXPe3R8arR9l8RM5DPtlP1iS4jVQwYvFyHevtnzyauh3Xzjv3mzS4l6SFDcWKH3kBp9d9PyEuj5jhWdJ10pF6hgSQRNETKqwhr2k6Rysbmos7kan1x/2sTjupzXg3eEHZyePYF5Iztqg7ZL5cuRljdnwKuLYY+Teh49AMAkYLAK3oL2BCN7O/RwL0+SZ7ClND78P7N2m5wfsBL2sECgkldgAadbYQal+gvS9e53vBo7OPqjPBjVfpOpghRAESV0JulfsXNpRqtlaXPLtybbL6YwfXGT85wqUlBlFaSphJeEYicQWB4ZYsAtFWgDkIpY1SwtgUqcH1CNkazDAwIkTDHCCoe0EoUHlJUyg5uuXpJlmhPeF91+ydB2BDAYQuagBOSEISjZwS5kJ4SUCExc8wXAaTiwcAE5IIYSSAIYlppev1RTNmBvvjyyeaB2AiYGXE8h7B4A9wKBioi376QrjcZQhgIcAULYzBFd6KIwRVuOAAZ3g08SYec91xLpt3VjOObpedFznv7J71c/6Qf/Q1catVtWs9VpoYu12UnVsk5FDExSda6J7ea/+kouX/qfLBe++MR4/k9VP5cKBhqDCDMxUmUlcuYl3dxf/8lsj31Puq1cbQfcW9UK66b7rf7zqeS3e0wOj6b5m0aqHGr7gh0wlQArCp0D/wJX0pkZbhvOr+9q9clHQaQOwngQwaPsM8ws74Rup/T03jQXb2wko3oTK+5BtjIxoI0vMtFBNsdrgtYYbxwHvytuBNnPYWHPZ/EXJl8W5rxc27tDKEkIMwiDFJzNt9gIeFBdeU+7zorzk69WrvrvadiO9OiOVY20mdE+1gRIw5VS79J7Gv//Ch/J/rh5wV/qfDqp75Zo5aXpfDzy7Z8Hq7S7t2wBDjSLcjGs8ymjiIsAB9kw07V5RFu5pH4ABEJSlhYVaC4DTLlyuIlxcgcTCBEEMAVCAgUscgOEEHrmoKBcURWlNysjyw8TA0pqB/USrgLJ0N1RNMooqBkJbIGZQEYeUPMSAR/JOvFvFbufWct6bPv/N7bxj0wPv44M+WxceuZt1aMkQThfFrqowqYbYadCVlyzK+qfD+/nP/aoz/8pn5x++MaqP8vqpnBLAPeRZJ3dOLzDhh5S92m355M3FX7xyv28yePUicTIAsuxAGfofdWt+Bu4HAGqs24vcvgupCKVKTX4rRFs6NSpdQwff5vwDvx+0Dx4I908Aln5Q99nmIAA/7rTdVkptwXHtA8Y1tvYxQvanURGTbM2zSUyVLCgV5aC7E83iHjq3ABeqgAuoG3oHo3Ibnh4yTiRCShFIIkm4Amjav6ucvUk100u9epRHuf+3obc8YEKJkZaOLAUmQUqnBposlUw0uS9/5n6/fLDx2J1880Otc7zr9s9OHJ9W7zy6e2LTKlBYmwADIF9AHmXQDzCNOYStbNBFnLiMZWU4LTGcFrVnQ2V0YemhjkBS2vVCSypNN+GgXPS0FMMAw4mFwwlQICnAMC0YaE3KBYepsewwNVCa+6mx/P50RmBYQdEmrli00oXYu6SF76ZVihVSKLg6aWTfvtHOebEueD3OPJCv9KV+9sPLzOZV3bGBRWrBdaw9rlodlWhYUVCXadugTrxgvP///Fecn31v8+6zcXzk4JcUkFxOp5hFM5T3npq+KXtLl3z2YvOvXo19/Gpdt9qEm9N1grazWtN7Amt/8gF9ELQV6/7C2a/GSvnfCILihCVAdCruXHQbpL/t9PxPWV67BU4PXn2jB+EHe99L/9uQXoO5DcDGlHHfIexPMkeLGPcDWYEYqIrPpaYqKFfolN6GpxNdhLfBmwkBLJNAoZF3Zlu4e70syhOZQYMoCYBkEKJED7GQrJR48Yb7w+ATGpvSA98VqzQWqHKESGwwjSxPmDx1Vbd9xArQm9XMzst97vjwoh+bT9x33Dw1nTh1PdsG/kBHyREVlGFBGCAu/0Qv1VbprDFCA8WoMve+3R44sviEssyeoXEagJOuyAzAqeVEc5hgmAam0VAUXrZNLc19HWlVIF1k3zc0tWiK+bA+tUzABExc8DScaK7ICgwwsewAUwOmBgzTcgsHpqGFYQL1iALsW6a2/TTBSxrjTIqVLqkV/BB08IlWXk1WcUbsFz7VIZN0hEhc0ZYllKaFYT//eJ77ms49qAc/WA/8NrcdmmvDG2vVwI01nLssMiepqKR1RUSkaXvk897SXvSnPp50/Z9ddCju/NFE/SCvQDxoSlBig0NtNsNy2Tu46JevLvj1P1f4+kXf2txXizWQDItKU++Di8EfN/brRR43eH3hXV6MzUMBwQGSiVA47ghyoZ7/APT/Dnny42DsV8LhHJQWnOUkgEHgF/efIH1MANfA+13Ap0uA/U1AzWoETIDMGClgGeBA2WAux75T+cPCm1IBTbmJkAnABXs3YScv8tSptEOadqlJlKQ2uQAwmDts3T+lf7Xb9KBk+sWrvj3AvEoFXQ+QZmhWyEwANNtLV+wtI2Ghdamf/+neHzq82Afz5BmcvHC7ubczIWU4pYrDNFhjEhkFEVVE2MoUDniLQ41tCFjXb0vbxEUHOPG9EyeQ56xnAxeehmGaho9ZOPFxyzAAE9P+RR37fd9yqf2LxsLJs+7uvzc1Ln34Ps34HDjxfQaWHT5mYAQLmL7HBAx8zCUOHzMMExPfY5oYJkyBaf8T2vdTY9rvmehCOG5DASsk6ZuyouG4vXKZdERLaVj1hc/zQ7l0RlptZ+rCk/G9e9QRn/lEPvzr12e/2BpnZ01f1SHfNsKNVliPILah3KylhhbTyud///EFf/jD6W+73zjxqdads3iUV9E4+PuT0hQGaW/+wvm7cPFnz87/018b++qT01YPzoQ5TZ2FN8ogfXzR9+os83KjjwH2F/DeOKMZi6IB/7b/KrMSlgOgP4DSglkesL70x6F+wAdBuz8Hi3qnHxx+f9L/CfBXdqR1hcge6FrpNG6jYorEW0HYvCNAVQgRAIK8qNZYTmoiz8Adz5yh6JLeIt+I0zg90cW3bjzJmS+bdHNAQCJsUGsDxCTXKxVM6XfQc3rYdCH2cjG63QxvE6EzsR90kQkotVotLpVjEOYJs+18ys3vnuf9dcYt47Rt8+bubsPo7j9undOpLz24BnaFFVoJFigo75uI0vVgbe1Ty57W4QQwgPEaEDdAYTgBDBNMXOLHDDBQR/Y8yP1sZilcc1WUCw7Aa10ChhOgBgxcdGIAszEnJprTwMBJLzIxAAzANDCxcGLhROt+wgkBekDbVnSIL1xetSa7J51YS1J1fBHSPFNENxr2+bM66/U671id99r8kIf1sMe47cDyfa8JHyJP6nLsur7T6QzLXkPevCOf67bjc330+S7Xfb95u2e7YVCNYAJ7YoZiswiSJW2du6dLvvjsvF/72tZffrZhnV40PhgEWAjXp9sHg6+6/h8enIugpwt1fTFepADKYk8N0oB/7r8OQzNVekTln2W8/YfhcO+RydnBCU6L4/wmP3gMQI4cncqacaVoS9duPbAZjHoJoQNEXUVUTJrtyAxlxmoTL9M7YYo7lsLe5DLkWxNc7w3ugq+C1cppL8uXuri9Ni2h1BGCFIQBA5Czmt25j2TNydnofNiyTVAWdki5+JDpUKaX+mKhPPOOyNhBzux5ute7H57/u3PLtprrzadvv94w1urh486xalVDJcS302tJqdDczjBIAGX7eEtp1EnbfmoAA8MJTsOJE4trOIrBaeAE0zBxmdMAAxN7+hYBT5fQ75dTwBmWmZh4gCdgGBZNIPDSXqa6EywwAQNMtA6NqaV1mNIIw8QwLbioGzjbEGCbkJiElTOJC19Uk9WgXZNVjluzSh1Zx2puNH3HKi86obMPblsP4SH761EPT4/cf236Tav3Mh0y6Qne+dWyr4helJ4vuuvVftHvfjjjvd9uPveyYXLMlGbEmsI4DIEM+82yJjWr+Y3b+s2bB/yJP7Pt17+2Zrl4ieg2aIU82IKephn8wSrzR0GfF3deqO+a7ODGlFxZ/szZLACBWVAGcZpp9j8y49H9zPDgjugHHt848zrUcbsTwKDyZ/4i+psbJjqkGse3pdLzNUROAToDYADgKCBNAIUPSVLa0VIUChzM5kpbzago3ZsegvuzB365UI1b/yRkVgViApe4FncRgmaARBA093yd3+SXL3of3Jz1YjGE3darRk+NJcMGYtrNJZeXZcdFZpwv0Bfap7u/7/lF77nacvH7TbtxynRs6uxqlVSxtK7oOgvW+kkrghHgiMF+/w3fqsGV0zpNV0dgz96q8H0YTt8fvseJUxtPOaAwfB8YptmEYbrYaCXxMd+rWcdjGnraRSUASMvQLyGQsdPuJyw9DAMnToAtMEEBh7UMnL4PDMAEcJ/+URP7n2UAQT/me0ypMPExMLBwko8ZsY/53vemiXbJELXhQESQun0cQs92PpAmK8drZDkCn4512oQ7eBRR5JdLN2raji1fcLZdcLi2Hlke9RIf+pQf8eA8f3JXp2deh5iMVaGjfDLPipKReElttO5xBV/wpx5Oue63s9ueT5qevgh1VCc0KvKnASRgGgbo4vKDbP32k/N+8weX/Ik/NJCal4qz09UokLEzrX/RDf6FnXe6yW4K3ZwVDifZ6gpKLmZqsgAyWZgx+/Ns7YxMMwjOiB8rlo/vUw8W1yk/ZTXpB52vPgvcqvhxfgLa7zNmnYFwna3fAOQAUAF0wSyhglqhxpCX/gsHOW3emnwpDYQgzJI+mFf7Xcnup03PKH00oQEI2ARYYiPXxyrCHSo5KxH3m8zZq3M+oNTysHm3+WOqQl0MiCoh10Hi0BqtPvN4I9rWZlWd4+k3+i53vb/3NbjL+Th5x37TyG6mg0kxDdCQVy2wMMx37bc7G6sePuiqhI5CB1TKNIVSgE7294TmR5wYWCzZn/IcjOHEcGICJpYWBwPEq3pCap3yyQG/G83xO1x9qVZTWu2swiYvpXIawIEMQwNwgLhaz8mJYWJgmFjfg995jDqOo7m5Yy8nQMUTwMAwASPgRGMupkwguYVV5Dmtq8jzuIr6uN/Olm/7FrKOCrrLPaxq4o3bzzJAco7f3It3DnXhIs9/Tecfjgtfbw97Do96xOcfaDqX3gw0grG1XAtD33/gXiMZK7pVLJQ8ae/6It+D53rv0ez89ezCurmlmVYzEYaoEQYp8fXl+BFtwpWydzL89YsH/ak/ddGf/d4apJeOB2fCsBnU1JObDa9Xp/2FF7lXhy1fvoGr93DTjNcph8zijAcFGxNQMza9SHh6zML7e4APp8p+HIB1DN61mAQwKP3S9lUFeGsttQ3i3nm812A60FbvQaIuA6KAUnu3ThboCZdBp6t+mb7R9WuVvjGgzgI9PBPSHyfDv3e2+XunE/ScFmwmYhGkIGmyez2bQ5rl1o/2+0P9zTnPVi/6syeb91fnbW5oPkEjMfTxZdlxjXB0jjQSFlrwL240sYOn2uXvXvxH1hMuPZ4y69PPuTt57nquTNlUCWWb/ZOwLWU4Vq0AA9/wbVXC0EGuZFW6FkBXooL5CcOjkldoxoATYp5YLAs8Qo524/H9MqkiRFolAo7Eix2MTL7LgIrEpdbkE7YC1oWTCi6iUQDyOp7ARtI4oSLqd4CiWLzxOycnmZKcR8Mx0jgBYkIzY8ikyLhqiRlWbeS4glME+B2IJylSZEE10IWxETtOiZkltKMXgfkhLzrRH3XAF73RLjqeZz0z3e/r3nH8+ruiadmakeKr8na3kV5TCZW6Icqw0RVtvp3Pe1294088n/DOX2yY2zb1rLvqaLpRaEsjLbsVRXQaWc4Ghj757OLPnm396qZwu9nkzYvrnfUa0KTYs0hrfrjq/XOawtG07XLHby7Sm4vxWlwgCwAPGR4rgOr+HqhsNU5/rez0EuKXbhYO2hnev07cMxuc7v9H8YPVn/mL2T/WAg6ery3Y91PP4kFSvMG0LTKvnbyt+0yKDGWUAqiFaCSVnRoJo+OywDH8ThawFjtM9jMz/Nkjfn2y/mLCNDFTQEZMMggzh5AlBUpFyjDpvHPXzwDP7v36x85+8NErf/sme4BT4tX+evJJ1taKahnEJiOXHH/WUKv/Dxqj98/97vNL/My0eds3F2Sevu36tJkX9QqiooC6lLlK3Jy6xERAhxS/UgkSczxIlUpXy4FVvM8gkVbJKDlHUDTKdxBdBNISFVCINTz+QRRneTcH8wsYOUY7ZMtcqq6AeLhf/YGgrH5EVgVW/AADZupigMCdmzmoG0SU+B1NYlk9RkWExAiYG65OBDP3GA8CSnTjgoUtIWBbKq8SAbjKFMYaWTH2loikhf687dTu3IPH7cvYcWZ+2MO479fG2Qf3M8OpRjzJIJ1k7cY4GVipkaUyFYrMBvFa56dOGRnv8GPXz/PxX+244HenbFu3jM01tZpk1L2WiGvAmEoo52vMr+0f+do29MUn+Tvid8NgN52hxQDJsillpmcl/S9d+qfOOU7uEODqzNud5ArkQJqVDhDBJKNaJp/R1h4l9XNbl5Gyv+kI8DJRi4cir6F99bm2NoDL1jFfg91e83xOSPUhYM6ZBqABIOLRIdIBLb77KhvOO84TtoYH44ydVwNUYIInujN377b+kqy+2fjj5mdUAitIgyQ2CZZIQKDdSLHZpZWso0mvfq7n5Bv3+pG8ny/k+/qbxzPyRxu0WA9jdU1ElkgVpSfY1M23WEHlFmnaXmp+5HCf95/ewUfz1MvOpnU5cfz6hKml1ppS+VHQqohUgYAR6EIKnEJhVISDVFlDD8K9AvcAMdIeAV7ne2LkEi0DzEUMxu/YWMsCrQlIQBbIEV3GMWx00YPUBL/APa/5UaYZ8COXjYAiDcn33IMEK/cAJ+U2KUkFyJac0UbuX3MP4JH7E5wcHFBavxNyahMtSF4BeltTrO1K1bp1qVuqpPsQEj6oRI6vLOjulkh884WtftEpbjud2xeX84/ND30g7/ftcd6rNIOl5qaJ63q3vc3N7roOGvWjxPSXGcUuahRV+fx39hf5/nf1S395yjnrSdOot0Jlr4n7hjJp+bWI6tit5Vd53sF42Iu7+319de7DBofTFdZCwA8pg56+6f/wxPq5gdUA0wO8a3L7s3whJ1IBgwcmIwKIYNqMzc4RtgSuTyO+fA7wt84s0z7gu+oVP/kXQ16j+330vypIO7C1VREdIxec4hG2dgD0twGzIDNWruteRyTqwGo8cDlRnrgxykAfnDsZrlJmEoO+qK2fGaeYdS8be50OoRmmqcVLSOlWDQHQ3cNTNqmT1Fhatr95/Urf8nv/m8cz9/fT8tWmuLagBnp5cNktB4pR5JJnKUVkXGZLMzse7/2u4/N+EHe7qE5d2GqduV7mNy74tdBVfhTSqq5CoKsxV/BT6oDQUvTaIINiLBTinKbiM8sBMGIWXUrdooJgc2AjI0AtXDBzO2ac1DZimhCoGYBwuQIGCAgIKOYCqIEAmkwBBKVVIjACqBjETVJQEMuYEw2im2uEmhCgELN4otkBeg11oeaTrhpsJso9qyHt3BZboJBSa6Siftt2Ni8603ecnS46GA96arvv1+vCg3O01jWTdlz52BBr6TbtukbLK4VOfuAoU0Wf97KT9Z7XLS9yz+EuN7ydO+e3m/asJ45Pusy1lIluRMm1YXEsES2qe2Nd21d07pH2kGfr/l/1I77lr9A5kjSTRaKUBo5WvT98YP1oKnRkHQTuT3I7ZTaW8BCZx+ABmA5iBltPZgsA/5P19Jeo98c23r0p5V9Ngf9LH/ChyGuEv5h9RQWxzRas5hDbFISiWc8hqv+JIxGAjPcMQCAQxBaqLVZXqCO7L38JTQENPIKuwTfPKmybiz+Frd+c9J5B/0VDmLpoYBAgCAmKMUHIhLOb7+f2DUdbsGdeXvDK9Svdz/f1mU/bXosteTVLTydazWmFtPMI3IwMSuXpeEQuxBZNnmb3HO76zk8v8u7pz3oCP3Pz/rl7P/yzd7589uLMwmiVpVICQtpRhe4tW6GYwjhXAAU3FqqBKao/9PiDH+XVWcExbVPGKDritQBoykLNMQBbwhN+p2J3OtIu5ohqQqnJ5VqOIEBEsQQIRBQUAwJQEEDTqAKommPaQgYwN0/4HVkZ7/AbsKgxKj94TRqJB95zFIVxh6BviBK2zEqykHCrxJJUW1Yios8PsGNx2n563bo0XXRiOutAPvxRnfV8XHg81Pq0t44VrVrPKimuVEjJe5Vtjf0LxDXbtDt5gS/xvcs93/P7mSu+mxv58CWYraa6ZkV8STrVqjDgCxoNvWNzd9Eb01mHcf9HxyO+Wo96sTeWKzbwH6c66X3SrH3xAD8sbkq0d3DX5bZuokhBg4tUAIOtoAyIid5eQPEfAfYG0Mc2v7rP4l8+AcT4HclrkF8NwHa9frTW9tBqcs523EOOa4h5H2ncRcSMrbUIjML3HH5KVip2W+hop1Zg9Ykoel8+T65U8Vf1oRn+wl386YIR+h+aVD9NEUt3JTT7Z/cyjaUaHvPNZfvWcXsfjdWYX/3iUc/2l/3M8yt+hTNrNyfQNP1DjBMdsrhK415kJP1R3NNouCDa7uWnn/aPv+pd//8XvPY/v/Todz9z5/Nn7/7Qz97z8rkbMxOeDj8KoQtaafdtyaFbQIFOrgLu/Z7UNjCo5hWv59yeX/mKJLUyA3OkNjBVMWehRzBnsyhF3NyBFFU8Aa5ukniADs9ojRiAQM5EjIXRNwAG5huMhJsjQMpinkCTJtz+gHkLzGv6EUQbdNCKzOb84ATkp+SuMEIHlqau2sA3MMotdbPFRxNFs54Wauxcjm3L3rl0de6J7dwX+JDH64GPaMfxvR5G3XFgnUwrqnUpWvQnz+woNSstGCqme92aL/zRw4m3fVff9t1J47VxZKkHtSYtacuIpONeHqFhYzhvP93OO8yHvzAeeF97+MPb1gMj2tr5ylSxaXT0XpjB1xf4JOVywb3BK5c7rApRckB6TC4ZjOoQecyw028fUStP7S76j08Ufnlu4YtDwHMFaCGvkf6irlBxTrv61q6tItkZantMu97Q1guiHkKoj6yCrBBzI7VgNcVaFeso2QzKupu8g/nXaaNmFSTjl+aCTy5GL5N1RgOnpCyFQVXMSmyxJZWqQTa8RfVlIdcdG1rYWs5+bXnFz62v8i2c82zTm1cn+Kpuq4hYo8t6jKfjDrK3Y43jQd7UNy/f/sLT3v6ZL/i/P//l//dnPv3dn/mo++fvnZ+/4+Wn77g+cxwJoRuxt9Ja931XBYCxAwJSlbJQRe/v65yY58K9yfYeTw7GsoKrwAgIEUZX0qIRN9UEjIwwJgATHqgdsLaFGbJlFnvMmhqAa0IFzFVHYEyKKe3m70sxgPcRfiBSsv1gpBm9E92GdGc4traZAOwodCCu/5MoY34wbT8dWxe9Y4nnvo6HP4ezn9FZB7H1yKLrVqNpdF33VlcR8iFxn2uy5yxkr41Op1+z3vvd673f9rD5km9mJp7nWvNv0aCaev5YbSkxXltdbjUaLaz384/rUQf0yEfrIffHI57N7YuhGhjRKL4zG6Zw8u7ttEsu+oW4ddLXD+DGFUY3USdXycHEYDALCi0QF0x7grA+A3w8pjgdE768inw6uvDdn41U838XeQ32q8+xk2GsmcXTUgknlth4+egj5z7K7gPqkln9/cvMbuXO7sFuiuoHWg5WPdGF8iJdC5bC1rGR8MZd/Mli21voOSt9F/S9ZsLqUiw4b3GDss6IXCDn61qooVfKDm8vfG157188vp8vHi96qW8a3Gz0HBTQUnJJBl6suMoolI/mmOd6q/793r1559s/83n//Mtf+68/96XvfvHR++c84vqlBx+fu/QzF5ZKCfhkX4XSQRlGlfv1yUXa3Cpq6Fht3+f+O6E58DtBYMRUF42MNm7QiHnCLTqqOhpuuLmhSedaG0EAU5q1mIDiFiThRm6YgkMChJzG5FEOEdzAsZuaAkaAAR7zQc81ERIE5HOi6ToCY4rMQbCaWrSu3CJJcsiGIMnTNG9y1Xkp8D51Jztl1o2ktA3lNRNpDVjN3qiX+0NwvXn1+JX/zt/7H6/nH75csNTOfIEPfXI89LFp+xuLbtoGSjEpZGyD/K1aoaNkqIROz4Jrrdmyav93XbDlHL3IO/z83/dxy5XfzU08zrSpYzLGnjfLc5eDxDYjGrYdq9N5R/vDn9se9ND0kAdOF76E+U2N9tRBXd44gRP3+eRrjydf+3TSZY2unbtZcKUsQg5FqzgsV5erKN1h+r8Tz1vkL/V1fW/L3WliNZ92Btb/f09eQ/4YXtAB3DkdfXRqpZZ/j4faSyoeQTRTaEwwmO8cfMgUZxCIcBnMmsgqyNVeuOnI3EvPzl2Yymia5VMDSP9vs2P+Pdgu6f5ChZuJCAib92esuBImVgQyu98IjJq0GyX9hl7duc5Vcd37jl3trU1IpsTJSRKBQRkJ3q8sQSB2VIDItSFTnrlDUOahhWxwNa15vFn3s3TWh3frH6e1KWWsyViXQlFmyFMQTGsXEYmKEnYSzZLIZfqivTzTR0LxCSKsJCJSlCqTRGRJQibNHO2SEW2Q0nmXiQVkEZFRkpVAVmYleIe4MmuXI9ojgCsEHKWUXFFmJRllVvoiK8lKfCEgDtoHaWellO5KDnoHJVwhUGSlUORQsNjlDucpsjJjcUkGo6YwiojIblSoaFJQC8KiXGa1mCBFdgWSiB+xUTQfiyRYIYnluJiYCREbUAWdJDKMxk2dR+cgZAmj+WR8a4a4Oe/7w4VvmrFbZ88rBYdV4qUASWHcPTxFIiY0USJMo51YRXvwmrPUSbrvw92L/+WHgcd/yHnyyQZJBgvLkRTxvl8xB5rm8NK2A9u0JfZISqes/y2c9OWt/v87wJn0aufK7q0yRDISJqomui7yP88yn21xzdJJ2Q+92rHQbRlp9jNKuuykliWUgO3ipm8pHRUcCtYPbbVv2460xcfw5cuIgwYha6vhJhIPIH8F+B5taxW3IIKWYv4gQTBYsCByHcwKgk2VeT4JAtxE7DFgbpp31+YMrPZe3fyfQfmroveTleBZI9FQsHj6/svbHZp4MZuSUKZmgZQsXWVzy91cu8qLpau9WjAbdptup0IWTgrZ7G42h9WhqZChMJiWAGimjxtfJ+PRFBrxlpt1P92c/WM5+8WwbjH0tqknr3rd2SQFw1ZQZbsJRQCpI5oFDGZZsFsS8YUN6pXKm2ij0E8uJaIJc0sighYBt4iSKyg1BihHWemuBA5mZTsbtUuycpQBCBTt9ojsoB/kjvKKEmDkB3IFB7myGLkrS+8OcmVBE6HIyisOXsE1OY42BzMBXHmFUGSj0rPrTXBlJosWu0Vd6UopkWDSGPlaWzGIgJJWFPoiAZuRXZJQJV/AwG9gFArTEuMvmI9jpeAmlxc5M+NzGA2zpSnnp+GioeTunxxX0VwfkQxCbpMlmQqjGCjLHCCaxSDJS87Nok7LS71+7738wQ/oz/9t6faTXorNTqmJ4wdDGqcwdKADk4khJ8CY1Xau9A7WfEuKX95Z87t3olYcaXOUoVdEmDBYdt30fKyyvxDMDxqbUDvN6INK9wtJC2/FGQOPWBGcUgF1NibbIhfeT80uc+XfPL50asx2/JV8TF9eCeAgDdKEoE2IIcNvE3uT8C0oJjBffcgHx+YU0ICo4wiXVXBjojsT3ZpoS9BUOgQ3Bs6MSpZBYxAn/c/mpv9wAvcOe6lMCdoqKQJi7UthWKQERQ6IhWnsojCybFXZrspc3QjvH7vSjzae4Zu5W7945GbjWv/GhSa3ZzolfIgU2z9b8dmpBpIgZBoOYcIzCQYUKppn+XbQixdn/1F56Z+UjS92a5apV2TT2BKCoJvH371a6xbLrbu1JRFhUhAWp8QsiA8EX4rSihY0RS7tA5QZjsVZgRMvRVYCGYUvASeZFE4AhKbtEZTe4RCaSpGVVzAqM0qX4V0pTmjLIle2ERxlDg5KMoAmSCF+FxzQZNfdyC+KSBgkUl6oy2VNiZDIBF3xQxExy0JRpBwFbGYBQyKsBSEddtOi2niNFPyksG+yOTjhhtpw3tFwvyhbb8g7OGs8sybAAEBTI8GSoIs/JUFVpMGSm9EMqXwzR05TuoOXeRJe9g+C+snvcBZ/ZH3/qLe9sGqhMCRBulBOfzhTENl8n/c7Fz+y8js46XVVfNuU3+7Eb1kh4OpkR1BlICwkjFHhVRb9yOV/oMrXe8kxkT0L9jM6dkqGxKbKKh2uVPSStRS/huI99uBfuN02btC5/KSdPXFkmzQtaSJIY3s++Sz+8V/fAWqUg1WofKIMh8jx3BXeUusVwnsqqVqgmT84+2ebBZhNCDcQ3I2CO1O4EZlVojNLh4ltRhEI0hQRe05u+bvwSv7WTrVrej/vhU1AzZ6HswIDBEMCk2T7KSYJewKYFhEsVCAi95NneLP0zHx85prPZ05Y7Bw9bsR9EpnJzGh2Y7cIJpPPqiHgmZMrLAJR2VSZrgpOjpf8UtzljXq5WfvDw71epLPO3KCVDGTAu0wqvWammFMMAmEmJogAIfATBojIjUDyF0SKUSuqsNFsWKkR4iAOZWdSELKSaY7gHl3ZqMwWLb4YlFl5RYkAhaFKICuFNuUulOAfLQgXw/FoEL8yKeZUsTaX1I0klwrLQoByclfiF0Wk2jJXSWSWTaOtE70+l5OJhsYcciVlKRMpXNTuLprkEm/GLKn9Kn17oYp5JGqioJlYbj1QTrqBmLLnqdokGUCX7Rzb5qzni/fmLz459+mf0Bd/CI8Ptqd0gAqDMCQhGBQtzYQBRDY+HErpVCSDqrxp+l836x5M/2sRfw+Z4lYruwp3ejAitzl75bo+YplfYO7FKOibyl6ZhwXZqcpYFJPUkjiIk6TK4vRZKzqFPrNlfo/ZZitrJdg221dM7KLg44ISs+Rqt+5a0IXyYOWUVkIdkvHLTtKD65zYWi0FQOV/wWkiEUTOYEERrki0deZmElxXwZUKpoZT5ppxM7vMGRRzcfy0cOJvhuO+M9Eyy72qqOZO8+1Wc6zT3tNqq5g4C5owNbAf2O1aer3WfTW63l3nOvcLlW7nFtMW6WSmclVVhaABQlZkd2kJgyDgml0VTi6GMJowHVQ+Di8bvQ4bnm3u85Oy6QcysNqgT7ZDr1M6NX/PU1PT2gFRAmaRTiginidJfEnED3zttOwvmEkOH8VCiNtSupCNuFQQHs0WkI1ol5CNEMCxWMCBG9EGEVyTrISsJBshFBlNhaZFe5G0Hx2OrLw4MW6U+DJpKshUmRSQhKG5DEFRKF0UIMUXEQm+vY1gV0uWqRqd4HtZ8C4XKSfIVxpD98N80Mn0wP5u7CA4PFGDoSpqcqLmiSrpTFRTMaxXRNoQRYCiCSypAg/anUd6wdlPFi/1i93AH/5j6Yd/rK8pvdZZPLEEMcIsqSCUac/WYiYs3KdmhoGUn1z/O9L/dqe6X+r/7R0cTE9nrkTVLZUJB4eohtyt6/pRE/xs0JtKxh6PWfrYc2ORJCkhUgUry2EnAVMraWc2tNHqZ1MOUve+1nX9LueinbVp01E+/cC2ipePF05e4wsvhFcbapXQVKTk7xN8F8QtOG5Aeg1CQBwKxQMBznmWiLCwcMHCrQvXJLtquE3MhgjEXtx/rdFMzP6Cbsz63rJjfk+tPYXu615mK376sw+OjXdai20ixEJglAjMMi0LZxVUp6s1ublSuFk7/Dk59Ia82vV04Ter/Nb1DSe9Q6JSYjACyg6kYEBQ9D+Oqe0Neagp+VWA8bx8kryG9PGh78XhjNdw1pOw5mIaSNNv+j+dZgdJHjK5LCVGEhF2AEEISNIqLXks/sryiZpMT2MlAFxfgI8CcUgFwqPJYWEGpYfCX+NZsshK4FKxiMW+yYgrSrJSyrYgLHZNXAlk5SKu2AUHZYYUZO0yQ2hZIQ5LeZQokUgsiYif+IfkUn7iC0KWIhERE5jq8t7nHdESLZdLkG3duJfcQS5uhgs0DA0wXigfJ1gaNTZUDNWy0KCgo7vasSwvzLMoKTJK0JwG7xyD7GLqX5RzH8OmX3RnPfkD/c++l1qktBubTYQmCNNVVY4Va6cYpsZWmhzCo8TjTOnDpP8trPvK9H99K96p7PrOUaEOh3RhjCCgCXvT9TMs+jELP4bE4ntyJ/Vb2EFVkyUgLcnu3apU/MQeigMq/wLm2YMQ/T/ui7qt5urjd55Re+Jffw8+rgjQXeXTn98JaAyz40ByBNU5bFdJNJS/5/AHHvAWQJCIMcIBiFRiKgmvg1ybzDWEG/fJjbs0/5fajTmBQNBEfGJrfofc+ruQpuvZJsE6YHZnz3dmW55ibTG0L7yQRbCqsGQSAhvXtSG8MYX5wdBb86pv4BXfh6HvyN67noOzAyhC8y5A2S6rbaoFjAIxApUME6aa2shL8tN/npcPfLpJX9yteX447dkn9z0Pg0fS2zQZD98TW6Dc3Ni+pSgSdgwzSfCI2lOmAlOT1TwCAVoJgDJYboEFuxaPm/mCEW08LOEshExw5RU0HZU0dVeClOWVRYa4UUnzKySCAldQjmhn5WgXSnB+Uem8IhVyAGlesVRceBGRpTjxE/ElTkTETyKkNMNDbFASma4ahGgzThZHKZe7bGrGlC7ph4vLcIm60YPL1cCHM4rmy5NQzQVlOvGuZnwUmKS8b84/+oKpQ2zyTM9lcfDcvOiH5j4/f5X50WeZ5TfSTUrTHCIAqpmdumdP91SCKtPl8vSX4ESTG93EDZ341Ub/77n+7/cKS3YExZF2PbgQEgjCRZV97qLPWPRTpWvmGLl9Rw4L1QNLm0qzqSFSgRVijFYfC/AzoD8guIekRRrHu/nuo73CZoJv2Ag+7jh55Y+/fwtkRaw2dC2EfWh631If0rxJ4RrgOUEQHrRbKxMSQhYR0YaYmyZzPwnvQmZpMl2mvWC6H4lNwACaczGTyoM69tvkmDehkiS4Dh9vZ+GH2u/HFluzs0QAMcwQQVEZSM6GvIb8ZLicWO9OJu4XD3pP93+z2XzTjNyCvTd2MQpOVbgOKCv1NhtFoZQFUAKAeCbCJKbrnpp2E2kr1vIq9eim7+HNhsc3a55Pax6mweX0B0vD/YyUGaJRIEpw44mdIkwIbg6kXY+ZSgCsvSiJwxDYpRgsXiQkMbIeA2GQEyGPBW0YkWFhG/AFu5iVghtljl3PKIGsBLISICtyazDuZwiZ4IRxNhUWx7EKxGHRqgfyRESkIV0/mTtVTsqS+JL4yT1mjgM4nAa5hfIBuQkmBpOri20Gw4Rhpc1dGQc4G6OHBUVnDSRClQwqxAgxgYSx+ItH20xhQGNFPls3QebUnf7g5oyf0abXu8Gz7+Uffqc3pl40PeqIDUlEyURJ8R4Ji0FwpS4rZ2xyQxg5mG035fzrw8Vfumxzh1R2FTddqAyNlCroILMRuc9E5gfCvKxq68a+B+4K3a3YiVQcmQKpRAKbnQKYq3Ck0hpoQ6WZwO+JzmahXx1KHG+ChxVelI9PHvXRpZPeK1CXmW4xM/NsrqW0EM4VvqnQFPBTInQ7mxAKEVMQApFCghXJXIVgY6Kty2yrwkr8HZyItqB2Q99M63QcSN93cMvfdCc/JrcL1mA6ZgSd/RQbarVaHX+hmJyTeJZclgKHrJMbTm8cDOLuvzLxpnu123T/b3ab7we8NJnBKZTH+gJGUR2NZv0pObIi28vCUUyVCacSCOMmcvKg04262PQ/vVv78rMzHoT+411/Sr10djZW06QdehKoTG+NZmrAwkaNMJHM0Q8W4wYAsVxLwmQXitgXLF6OQ4y4wlOEvPDXeFdcKcUoc6M2eIBiKV9Y6J2Ul0+geHT5AjKxtpd9rQNrolJK2SObFPkgnhSewsckvr/IiHF6NK7k0lHxWKtsTpWSI3K48UzhSt4kbin52kwUl9tN41MZH2D8QONbM7KloesyOoO3b3BuqJ7dRbU0UBJFSft1usvRoi8iDZFiKd4+5y4ay9KaVO716tF9nj8b/PnP4cNvYRpSLnaIJSM1VQ1S/KUoFCYEAOMbLVPY08TQjW7dtpu05Tu44BK2vD3k7pxX6TAmeQzUicokumG5lyL/48Z8DmmpkguLH3rZXeJOWW3OqmY1Gku4XwdaBrVIJMWcyrt0/wMTaZ/qDtlWlebqBsrLmzccvtm/3vqk8OOXOwHW0Fk632+i2s+14UKwDdXQg/w9JN1XdAXkMpRK4qGYZUqYQn7haK3CrorWVbiG7Ipk1iRQsEmcGZq5hwqGxyfXfstu+SVbe0iChcgslfRhBZAOYfNtP7bSXv0mF7WV21wrHoqDQ96mLBp36uy7J+rm7OXeTx/8lzcTl2d8L9ZuZdVkz0UFAIhQCNSOhVnabYAcXYAq1WBBA5hijAjSgJKbRFvik5ues7vTP9ic/go2HJU13S6zOKQWQt1kE35GmIwK2Q9OiBKw/+2XO1MsThgAeCwYGLiU62GMomgGOqkCwRo+FFg8EIUo2k5GtJ20S3ZRFuFARm1tLMcBII8T8BAnkAaIE3AAqwYW+3Ri4jIpAd8OkiYIDuJwk1ukJWQ5PiDJpQyTxEjMBJEqo2l/2t/7QpHCaJy9TGzN8JQ23+42b+SS79PEWykcCKKzywIhPxYqpUo1xfskbrQ4AZUEAQcxpLOv3NBGrYiNdCavAV6QOmo2XT57kYk2fXiVWn0Njl6lml2/HqWxipUE0TSD/VEQlNvAVN4Dk/Fo3KmZmCg7w+iVueQtXHAZLvhuyl45PZW3iC1N0iWfVeHaZX4KwauKK1I5ZjwQnZTse3oR5UxqQKrgQDoo9mpwo8HvK+k2ipzTPDO0UvzqjvWrRTLN+qj9KLu5V/j1nQDtIXc/sSbD2sT9FbTaJ+2D1Lav0pKhzzpkU/DB+A6KrQyLOEyQTKhwQ7LXLnppoheksCbZRROYxZNIi2ODS5XQWsJJnPQVeSX/N7vN+8q5l9mSqASgqLANcs3t++sBE4LlQ14SNgOaGMlJwTH4sL2A9KaxrlYj9+88YHPxod88e/V35L1NmWtSaqw5hEQhCAAYIKa7ZKRTMU0TlI+zSWm5ch27OA6uT04+OA2o5ZvMw7uep4d1J2ntyd2akzeDpzAYkEnGquaN690212lzI7MJr00oJkOHMphGUbLfUAcKIFbCKhqGOPQ9gUF/Uvj+MISrCARwccEu5kAghgG7uL8d4gDExSCkFAAeCiCkkBOAODZiIA6rNBULV0wQi3AZ9McZFN5FREoRxBcJQzO9B4I8OheuMCfnEP5g+ZLGD+biO3Ph7TB2bSau3PhBcsPgTmTVE5KzapeanYokk9KI2Us14EQLL4xEIsMGpXL5uuRm3bhH8ML02nDW+Ucvc3t3mn1iP/yWPnsGCtZM1iyqOHQTqQCC87soORzOBlUz83pQnDu53CSjh7Tlni6+hgs+Gc57u3NvzzyXYyS4fupp/W3o+mKS/ZyZj0w8BXdReihkn1XPWeqkTLCSdCAclnMaJYAkwILEbbXcZTk7MJyea7y8CLh/DXG1BX2z8OtFj/rogwG+1oKncyHNjOZzKK8grl3DpyF6SuUd4PSAYpFiW9sikEoR9CTbQ/aqytw3mS3LXotoYXiZJDPBLLQERgCGVIvBJErfqJv8d3Pr33TRUhW27jOFKw212++UumkFR9pzzAMTbtYkNxVN+BILcXDHITc9wOkD+/aD+3/96oP/8uYBl2bwshvYp9e75YhZ8kkEJlEABuIDwa9EYCQgeco8O2kGn1m0genGKhrPkpuS0131PXt2zotp0w/Dxou0afY428pam3MjrI9otttqYV3JBLQUF2RELhKmB0JMiIMQh1ID5FIpiIMT6yLE4I/jiYtBk5hYF/o4RgXQRmGFeAD4gvGHCfuyDHwBDLBGQLy1ASZ9mhqxSccDPjYKt0ikSI+C4ADa8ahcV4nqwJtxGFhMua3NeJU8kVtLfiJvczImGN3uhmczcjNddD29+jeQu2/scpKpC5CDMDrJPFuiGnYQJDp1CiFBiKBlRmiX2aHhz7dQsq/WqrYpJL9OYy/MRq3ep3fp7NMr9/WfsOtf1BdNZlhY8wlV92NpynTSAAIFLQqizO4RhIEQruDqJFfCxH0zfre63/WLV/ziauiTFezpmceaexFdqkxpp7UXhzUv794qqR09ghsKs59LslMWqRKpIonBQVxwfA9EOaGDPWEJhL6vcfKrGb00NSyug6EHtj3QFwDh15cC5M6wu1+CBYO0xC4z4p7Kv63gNSY3UHry7QQUtAdEMQ8kKGHMfsGwhKAGXo2C5U52FQrX6tWTzijEpsFMtAjAkEY7F85J7bFz4/8dbvT/XNWd3mcq6om2gCkRGzSoBTIXBAuNYvG21Vlm0UwO02i+K4yFx5XanaR2J5fcNh/KJ+lBXx627QmnCxVmzaagmdepmYMdgkiJjUxYFFNaLokIAwQJTaCZL7aRYso6Tbq1zcx9mjn/+cS95xMvqlMu9Inn4aRZ/4TndKmN7mstadLgjgqp8FQFjNRSxtFWaoVUCUlcaTSAeC0OxKxZA9rLwkCy0RTx/QnEgXi8ohDOSXlopQxxiENsxXRNOi5j6YTS49jlHChZKYIQG5HmPYZTRBxKikMrYIE1a+o2HVGGbhtpwGi8Cp7o85yoMDqZbffT1tvNhd+ni+9k/G3n7ZyaOlUdqnt+GIeAEtRCAKyYttQSpEwyQaSIQQer051ym0SaIXcibjfZ9er0Pd1r+c5ZF1dr85/IfvAiMxz6tk1m6lRZUFCMciihQodFTFDt7DkMBKjl9b26cg8muyvj1fyB7vfFcMEv00W7iQehMBSF1ACdJUrVYq+nDSuTfnnX9+xF38Oh5zj0Hic+JbXT3MdSBVwKZ9DCLBEMMvLtaZRU5DWD/xGjHCH4TOb5ZhQvvAB8G4wDv56153rTgfeuwNEazB8Z0h3MeotqE8qfoug+FQ8In0E6/R1angqAQoPcr5H4O7Jr+MqjG5O/D/m1yHbEKEtVudk8JYTatWUrTCqn5Nj/J16J/zQ4Zsde+g8/OvvFJqNBkZ558zc5kQ6pmGLiMwtbmStqm1xPHsiL4hg4UWh8AOG83dno/tHIO3nVd+kVPn0zsg09w6r30NnqGIMKufWh3VmkiKAArMiR2iQbmH3zvkGRyLTfbqu0VljhTRbiNF+GLmWrYTvPc+Pr5gvWU/Ztp+153HIuNs3Xhsm2oRP1EehWzY0u9Q5+iKbVZqIMejwJ6Q3XDSBVwmBsrbYMLIW0l60hWSEoHNCgSOlzWwxlTjYWuZxQAGnSiw/FK1acLHUtZTfOlBwDgVYCnQBxKMW4tJSOQmzEuJdDgShSEU659gOl00QEovRCw/k+G6tjYb3Nr2P7cu7YqHPerHNeqQt3Yei6G94NhRCaHdYn1rBKH1bxjlPxITGTnaKI1JKQCaZ0Y6NSfII2Mh124/uchOl+p1exbzboyYu3Xzgrf6/v4grOnkH6VhrFUlExUHVUQU3mqRQCglhEfDELJYMSLuRF487iDpSf3eiOLrybLngr538+DN8IHBrGBuUIUreLKIeenAZOZOD11Pf0pu/4YD/Zpc9hsJN06lJNV7NLbGoSkKUtYZeCALSm6BaVDgEtNb0OA2cu3tEY7nfgrEPlS+C7K1DDr3/tvnoLkIbMlmR+iljUAeVY3b2pkrdUekz8Y7ZI77cD1NPgeCRjFy6dFSSEReP/zd6G7M0oe9WEz6rsXdO1UUEhbMJmI7Pxb+LXM/MepBdBLqkLs+lDudfvN+c+kXXHYid4bXSzsDMG0mSAFAYBQfZXPAcmNJuuB4+By1RwcEfStXHvzwrbi5ErufBGNl+ni67cyB18K3sPZ5mpI5UAQHWDZoqmUwMDZmkHVGhKJDQiS9bSVi9x1l5NRrJuc/yp9Pham9pmps+b54+b9nrD7vOJ2/uG2bZxsjb2sHniNDtG08knmUJnDFPF8YlWOCUY8Ylvk5jCKSE4K0ZyK/Gld8qwcstAn8RgiCy1hNw+zCcQZ8sxnltYi6FdEJpI7MpRmzXX77g23YgEujevaZdV6GQg1Wg1+BVVJCVlfv31SmENCz4Zm1zItImoYaNBY9B3rMT5S9u2rbFzTTtXuH0tt57Yb3uTF77hi1Zi67HacTYWVpuawKqANBQSd2MDKDGJbtneCgIxQgrCJKZMBhKyCYbIVEOngnCB24bseSI2/c2wsYbTukXfo6Fn9ecyvLH8mYXUO5Xew1lqXqgqVAQgVIUqYADSiLRE6i0ANVhGx8IbyRlTbkfZeTVS3Jbrw4XvNhe/DWPvxBkaCCCBEhDk7sxcMkvqfwq9Tw79D3aZi0PPReg9P/R0TaZb2Jks6xRABTJR4hwc4ELjQsrnGrqC6Uwzv4o4+cDo6DyMswungyeFi40b/fbne9klF6Zy+PWzkwDdMd89cOuvbhtHuegqh/u2dqdMr1wpb8F0RNJHiQyIB5BQJFQUCIRJA3E8+p8zJAl7krkmhbsqfzvJPTM9G1G4YlEfNBodic5MCadTrgKQ6f141PQ9M//Yl/iR2fgYMi1YNmBqKAkSwjoYMeiWQBsFxUC0ATN1PYK25Bm9nhvEk8C0+jz1zXuF3ZORu2Hrd82Dbu/OH+9G7rrUtklPHcmokGBWFoAAJBDUhQDS9gOiiNCJcByUpRL0XN6zSBq4CJaKKEUGq9StVB2bzmNt/Fjbcdw8c9kydTlxaje3Cxtna/MU53rTr7vWsimhWzJtm4q1NnSg3latrXrRF/7xqlAXxCGbaLE6UBgwZqhhoYEHgjJyyF0BCpKLG8fOFVmAuEBEqWKIZG0AOaz1KaCAUVB1eWzyOXuPX2UHaGTZoeZrNAZsDDA/cLSVdoj5TTa2YufW2HamLlpeLzjFc47HOYu88HXsODbr1abrfb2RzbZ/LFb0ac3WyIe1pZANRESWYmEjebSIiKaIn8wCSmBMlUKqhYYoTHo5nKlHp63kzMOr3our1PmzFG5UnZATIYC7KlWJYqpEhfzjUgcBJwh8iXwI0dZoyTewMC8mKOM7uujtzXlfp4u/hZFhKkwGJ5qzqlFBBPqKU+76z2jwfBh4PPU+n/rPQ/psk2klvSypRlLZWXRt07yapNhyXwrQCZQ7OP0aXF6lZktTFs+B4+ulY5nc5Ounk+4r9K72RR9+fe4kQAOwXM2PXYTzcR347NEXTOhFyB9C/j6gWwCPALcI3qIjXOEgSBohFiInBcJKwiLesex1k7nby2xdbqOi6+yXlzDazMPm2mg3FFA7yHJeojfuu3BnvJR7/aS517Om/2FRebKiAIAgaAaQJk2lZqRd3KWtdDQBCJ4nz5LH4nIo1JCtpSAHB6HDCvbOvTl7lRJe5bPN5ssLfX2Co1i1s0sDKES6DqPUZAlUkKJEQGIUERjHTPpaBGuOrI2zAFIgo2cV1tW2UX/LWte17vknMzuRGxbyu795xzo3t22emzdOXGZnYnZqm+l6ZpSma9PCTKt0Wx9ER5rCH9WkSnDtXPKAgSBoIIIT5wQBhaY0FcBBzzmw2DlxGvWkP3VStrpYACoxjBrYJhp1RXWLBlzY4vxWa/Rr/mzfuYEdJ3PHKV1war1oURcs1YWnth1L044171xfFvrR2Apd481qxHXX1YCChfgCLGSixdBPwCjqBEt+cmQhYoIRgYCiNAUMGAVE2pJOSfPgdKuedTn95HDWqzT4atfTX6Xzm3Q9pAv13ZpUBVRH0SQRitiICtSjpN3wo2V/wUAQyDxLQ/4qeV/latm6pYuvDue9TZe8SSMb403FqhKoMCRCikWXSkPPMq05LoNPQ/8HVz1P7jLHkFlIz0JSrbPZWCA2ALoyggmoIAjDEtBeB3QXjgUlF4Y8Vy1rjZMy0nsrcDYA1gewXniVPgp8YwXma2Exp8sbJvVVjXhTQ2664JGr+gzRJdCkqE8TSlABwSaIBCsLq4uKyVQW3YTodpTZDvK3pHCjMis29qYMHwZnoB+Bm812P0RrOIqbi+2LdS/p7GeLM38km565wTXYFlQGIAAlJCSUCBNqTAIEYxLNxCxTjBQwg+bgKTgMjoWCwKuSOizczQcTm8Xwdbp47Iavm6H7q7Gdyd07vev8u1R1hKKqEAApXblBwbVuC8kEK3RkMJWekHK7zlKWY/+0PK6UMsqsHRkuwhGwZK26qB7M5KiPhRlVvTfqHc50q9YZ9S5muzXbq9pozoy41q7/f63j38KPSrVKh2ut8c/SXc+0pFv1bzOhD/A2Nakywf2mOOiAKdJSpTEiUwEHoBoux/FR2zDKsrZNW5fNuPoD6oaoRo0G0bB2rNUPYmE9oqEGP9AILmypscmF/vhBzm95YZ0/44UhfyALW/jBR/34g0Wb0841RauIhtDESg0dmChCy2CwQke08pjXUJyjSxrBdemKiISTRoQpQU2mI8+ARKIdnFTQpHc1ZC5Mz+Nm/bGsW96sXxx6T4P9ZKfOPtPNjTWBPRsSWKUpq9lQGN8IBUlp4WjEBlFrofrkJxuu4mmRF42h2ZYOm5u0eYKLQUM3h/zePJmUkAbVKIkVwVJKL6n/uAw+oMyrN/3rXeZ0+Ltm1tSzkgxcyhyZYXcIZSxM+Z0ihM2WKJuBvAH4vyD6d4M8mBsOLiz3Lkxige5uC3ylB64Lv744p4+6nypcAz8LlA+F7sx5am0pcyq/DfOISs/R6CDNT9ZFLjoH9+wRK4ksLBJmxXKrJnNPsvcuf1tl35fRSxp+V4avy+gd5IegD8TRfOkYYJgALrd7BlYLgz94cJ8fpnNfNmsfhIGlS3tBHAxSugRKQBQCaffOyLQZqc0IzKKtTN3mKXlWbnBVvAgOyd2ucH+hDiv37sHQtTzw8HMXvDNbxjAxF9wYNZylBkcySkQRlKWComxnBZUsfJJo7MYWKgMCqQMnHEkOQyTGsibWslgGYxEOtCXHGk6TB+S43/32hq2tGD8d3Q4zUbUe6mNV61S95W+tafltagW3mqpUsVHdpkO3hq5kxEGRXaZR0tS8pBU11ZBVHY0acSMdN1K6ZqOP+WFbGGLHGredzp0rVlt7qdMj3F0VDQ9alF8ppRak1BKrlmTFAiNgbKicr6xA7NY1HkBOUhxWIiIQsCgkAULNT/xYyl6iqXvcPMAy2SfdhkU5+6E78wfS/zKBf4fSM1xPqUXKoChvnj3LTA9vUBiUaWBQghGEnfwaGxxdrMZNCOLSeHAuTF6Ss5SFbO7kEoQLbRiaJmd34jIkDaPCXK9A6Qzf0YHl1PeBGXz0qvdoyJwO6dNDet1kcpPO9FFa8vwEzO8UKV2mAoAW4J1mS4BjnP4DcfpzRLutYnkW7d4N7WZl+TJMTRnG4Ro9cFT69ckAHcAaoBYdNern16FPz6nZo2DCJuAJ7O9opHddyWeKXqVRbYWEik0ARBOiGDZKclbhwuWmITeXiXtw7t347SL3zTB8m0ZuaexO8tPgRWIRViMrQGdA5GRQfVj3cnHOzx/d+5VsPE49y3CCCLVT6ESJ0KRFIB9YEMQEPwiYyTS1p53icqM1uSw5DnkNhclRXWFdWbuO6oUezrybk0uuwoNudufdHyaujSP3SzQD6UY142173gDQyGIS0ZJTQiwhazOijYVAy1IySpdj+r2RmzryCSmgiQwyppRamy5SxU6br6uDx1SULbr0bZSkAqpAqcYqqCIDDCS9Hiuoxu/vN6QdURbWto1tQ5uMbDXUD7QBX8MCAwzUyPsrLLCSNi0kYSqIdTkRcGO8EXGJM4pLnVUUJqvsDW/1DmsKHIoSVI0oFIBpA0PoMXAu0IjlYPshvSrrX3Ubf+hOP7nrXQz66C5/9j1ud5kYUgHKnJ0XFsSqDbrrkoACSlSlEfoJk+psJIGpTz9SF6fhHKdChe97zmR0EbZm2baDS9K01YeJWfQkVZSoWa6g4ixPn28vmr5T6Xs4rb24s58E68EuvbrrWZVM26Q7l87uT1fdTlL+5StojuEAzUOZbcPQ/wLac6C2VmFL1vrfiF/7Z/S//gTrr8ycHg79eunf7k0y+ilnJvtz4eS2K7NXbc1vi9GI5TPEO4IzLTqnaU4kIR4sTrRWQAQjFF0EDXJryhbKDyb37i5/fTK8X2W/34xcwfBVmLgjB2UOIZolBDc7tDUazfOgG854Ki/yanHvV2frngy97UQ5kcvhR6ELoTSqwJD4YRCwQXGHHGZAq6gtBZ4f3DQVLDgWvCjuHuiw+D+n6srePXL3X9h+qi44muccxUMOXh6yf3vIa2k2+pbcX1kjdEA3tbaaKvEOA+Mx6fWoQOSBkQBCjsUqGFtZdiO7AQ4U1waL+odEJ5wECyVtWMFaoe2IqONudz5qC8QaMADwBXnBcs40zkZiVRTxHghOanjZEoZhEyoQT4EowGLBj6Uoa4mMIi+yo890t2StZ/qjcgs2x1RH+HGxQTJWMeDpe7P2g3fOOl1sfGTWPXS9DwKcfw+PvuZ23/Jst0vxgI2zVe56ahVhYqqhK7H4iZ8kImIgYI/xr9VV4NAUUioAJrKM1zTUwPA+XdQOF08lG+S2AjDWmBrsxhqEQlSBj+tdrX0YBh8Pvee79PGdfVFSZ+Ff39N21tKlQF0yiqfZCGSJEPkOMbhA2Raib9GWju18yjj9Mvtf/bcqfnrh+S/d6xl+9Rzwa4vPXNZfh3qxAE86sKpNHp6F870L4XDmivyhBv+RIq9qpDdUudQoLxIvYQtC4Zv7a9d0ABnMSpcVXIa8SmGGiUFGN1T4HnLvadtVGX2Xhu9Sdl84Fh5MmwFSnX6mquQmcJvQdwb3/fGDe//+k3MfhMEmqXTQecIZMNFjwMzhWE6BUWgYSYAFBIk/G2gk7UEn8BwWQZNGcDXd6kWaH9aC5/mt839Fby31Zjab12cfnR/5Sp37yvrQ/ePC47VjZd65Nv3dNJojNnCzWTo++eTxa0IqCovTIS3iLIBQaAAkOpEewISsmUdIU5ky1/DXgLWUM7UhBxbCNIPu0wPEsQoQB4hDHO/hDic4naQYtLQkcqswubxct0ar+0nJntgKNsDTeyHRDfYkh8V5lQwxQB9yaVCVESWyt3psIy3DxGlu7Lxhcksvhv6jZt3pWd+L0nv2HffRm7QNykMvobeBntRk0gPFRoUhycozQxV0S0JV2mHQBQCK2JJvjAQGQzjBc7kCBzjZuTDO5H6Lw/1hc06X1GnzhramMt4Gz+ULoEpUF2pO1dusQ7Cn0gNZ04W+9ZA+f9PfpdTx7hed6V1P51ILsbOzaIiGIRRMZum2q88CWAAc0IHWfwQsf454fA31/pT47oT5/q5Vf/YK4KszxEML+M0O8L4FIOU1syd3ArTUWQdqR+bnQTuYBe3wUFu7zyKdRilU5W0XqYD6ayoJwOGiD8SEOCACIACRgAy/6TFpgWtQmIavZ3Zr8ruQvaHcpYy+N9/loevpxwOz0w5P9ZFOp8ZnhmjF691vuu9oOPsD86I/D5ueh/7lYDlhTAeJQjHtA7o7FIofChDED+7QVoRZpkDlimJw25HuQp29KP0mERENqlGrvhWmiYV6v7DZ7Po8v8KF0zG/2M9drIfsx0MPfHzU69tFp6S81JhmwSytXmSQaTZF01SpQkooPDd4AnGapB+GMKhEhMuJYJUVEIk6q/WcNZDL16zUdj3lUpY76g9TEAhxWqSEbnBIXFF0ptosxeG05FxnN8VTw4AgSCm8vycdj3cXsgKM89VuZP7dIipi05w3jOPEffNpl97c7aI4Y5837OwzC+fa5EVNjtn2AdPdcyZ3KO04EVsSgIkpColMnUBA027endSuk3Z5yiSdoApBEIWL6LpyTNxw+QQ5o3HClma6QHSxHcYnyEd5h1CKl52harZbU1FF1DDZE/RVGEjUez70XUhmdZXqdr2eUt2Qjs5uKeXOMiCSQnOtzwREJcJCDKBhLphLgvwJ5vI37DbDeHiE+CuPpuZfPkH8aAn48QrwuAT8FWsAtvKa4ZN9fKt5xfPh8kpxfE61E5SzBVmdYOrviPkKlW9IxiNiDxn+iFk14qhBMQXiMmoWQJgMgIySZ+U2RuFaCqBCJGd3GL9v3PcyvoPx72DsexreprEhFMbilMLRPUVDjk6bbpB4aaFWNz3rw6ZXdM5zd/bTsu4spfukfUcU9uI/IUCToNZ9UtIMOt04kKTYkgalAIMIc6CRtZDVGG7zde3o84unan75TDPVc6fqySxrfpU7VvuFZ3Xhhi84fnrkoXrky7zw8NrYarPez9BrtFl6DRRlNl7LYvIVFEarAQi7C0xEZu1+sAFlaGDFNj4+agUDrYo4i2A81RIuDgKs9OMJx63ghFR84TjS11aCcwq1O5cHYmcE10u4eu+TFE3lqqVReiACB5zFB46VpsSm7brLuf2EfZdTz7+bO3e/eXbb0DubzqEx8vR2uvusK5tOznRcb7VaW7VKx2a6COr6IkFMAlkSaSw0YyYEwCB7AHJDDEFciGun0egCLsVBN9ql0bLbamZzPgzVaVuBrLpvxlGqZIQCIBHW8h4slXRA32QGj6Dn4q6v36SbwT5KPYKUUwYuU41FFxOEKZ/LdSsCMquMDsAFSK8gtEGuDaA3jGWLWP+R/Zd/U8VvHCM+nKj4xfNtOjavEH+c70uSq+U1zydzekL8cis+XhkdpmjxUOi+Tadv0+X7bNuE7Thgvr0bNL+EnEPmLIBRENkHoAAzb2VMiBltz4lZjrql5OchJ8qXVLhxE9duYudGb6FwGb6TY7tDbrNzZ+OKdAhI2KgmVb8r3JXU6fDLP/0JbHi52/hQBi5MHydKB2DqYIIb0Q2ykCUS1ZZWBEASOFFCjFVZm6RVOEs2sHVZ58Iw3yTKinJEw2o0GTkWakZuehj1/qT7u52bS3Q2ovW+va+L1qYdq9i+3horbJypnaveuZVbN2r7en7Ltp31wnrOb2FhqING2uw+6zAhNK50IgKRjUYq7GLWFBwy9a4c+7FXQrdls7LxcbwFZGWqqUR0g1BwB4c5JLHErrwZnNMoXJnnLvfWcBEVyZYyYq0T9bGcncLG+aU21eoTvTZWcz3P9DA7ljNjrk9kbcyzrbOO+9qITbtmJ89m8qLKJYr1g+sqa0KtmurVXI+YKdqzrBUGGiQ1QtnTaTLplD9ZbAuKmEVkqQgBPgMwuiMsx1PwavCmzismd5jG5MY3MHJjtsQwpLDNUo5S8AQzVFCGRFiFlKwJSGAFpdWk1tA/Jfvspq9SejmlV5N9fJNhSpn5z/zjUtVYlGMNqpYIQQmbGJAlkxsEOrbWvVuoSnZ7CqL9KuH9XeKX56SPM9b7c8TTHeJP3wD8ePNB1/97+z6nv6G7GgCvyT4Z6md1t/DX2oRuXvHsuGrer7i/n+Ft0OfbJTd9/6DGp3ez7QeofQLMI2B8HBSXkQFweDeASADiqqnaDsDkUUIX5Kp8x3L7lBspO4HznsY2bvyyTFxT9g4mDkNhdPkYsJrHnYqZsj/WRsvaym8608M3esOD4bQXdNoz6TspPf1gp6BglBJwWiIAEJBEJAAlwa2Jm8oaWINjFoycch7XwBIRnjbIyBVHwMqRYdMmYTN+OFFOUYNoYLvFhQHmh4ia0PWshrKbVJvx44lWsX21dqzygjPnC0/HtjOxdWVcuMbtm/ErW9js8xupB1JDmtSH1klliSPztwwsWaIQNccBHTL2FEVUfopY15gpogwJ1s5H2l4Tiy/t+fVrIxAZkcrGUEWqRdsq06bpqNZivYWZNmfbsXFsd+IEt0ydN832TdPLhjmaadcmN9051KpUre1XoDub6eS/rd5JPQrdlalsouqkdC2VaewNeLJGITNEoVDwmfOVBR9IAUoCZkrC8k3SLlahiuhKXMWD6Ll8WPnS5O/d0By2fH/YvEkj36WJbcrO4BzEk+ytyqcwowpRDRTFLpJqQqYNvQlSJ1PfctfT7jLJZAA9hayO1KL81FOzUyFEQyEGBXvZHQjqJPc7/Z0yl3Om/z3SXmZpTrI54DTTfnnJmj/8F/pfPx8pfV3Auvawbjxctmfb37gFIOU15XcCNAA1wFxOs5+NAM+7gE8T5p/ue/yzfbeZN5nXr4BuD6p6q9mizxg3EXn0mOcDpmOn5gARgErNCm2pCJG8Wlwld4TfhbOnzyq3FefKZDfN+NZkb7qxm2GihD+aNyUN0CQRSYByXHvxHNBLzzoNnEr/6WFw0Q083/Q/NIOrIdMf7DyRCgneGpzqpZniWpGpQgd0JE8CXBFcwRAsaA9ySw27FO1WJPeiLOtqZN65kNlIz9ep6lINGzWjRtEwoppfi5pZYzHVTkevoVqNN1M15zdqYZ0LG4pqLQz5Y/0yzKcaTTSGWhji99HYCFvj1/VkOyy7kY0hd65s8yu50HejceTqFCik5N30RGHrNKY2XFELvYFpeabrei/MaNRbYapmRmp2QqbjL0q9xdnKX7lam/XWZiLrFWsVdJTuQnVtRraou0WtUnFWvkQ6Ry0eqhV+EqYt03ZdrFWslfj7fQAt9TX65K5628KgAkMRAS14IdWwdHn3cms4IBgJGdA2IHhLDnjukzWEZ6eLcazAXnIq4zsY3tDIZsjeyPhcRg4wfpdyeygMhiuxNXcfugIoQPNvogqKxY6SwdSbp36DzNEhsxgyXUrlRKuQypAGpXyRKaDMPJskkQEhI5SssAmGPI+tA+mUhOe19fWPErS8Bnj4Y4VffU7Fz85U/OgC8EungN+4AHxYA5Dymv0b7e8JwH8egFMAfr8Alh5gjl19OkD75tDjfgi+XdK2fY8tPot4rRC3AByFmYEYBYge4hjs2AkK7IBCQEClcs89XqQckzMWZzQfjrMx2V2Tu77I3ZvR28P4XrJbyh6SW8pTp6oA0WbYJY5CX1sKBHPoexw2PKeN57DhYRpYU+Z82DjNuY7/bZ/0cVWsokyFS5+qAsefGRyL24OWFouIojfODlibCGtQsPuykYax641zSxYLpPUWiam2I2kh1tImh8MPU4yWr4/SxdW6mVTjP3FU+9ovgCmqudc11apmoltDEyYiopCpBlptbG33xYjkwgqHIzarEfkcUbsbThtQjOONAq1qKVUtkJoCHXF8UoN1ZGBLehY+1YjjD6YljJkGRUoPGGiUH8gnabAYlAFBJQTJrbByLbuNQBCEsBqYxIuki3Onkq8lVyQ70X9gYi/bdpuhN7T1chrdFt411duYpZrEj7vFLtRGEwslFamH1Mup73jR76Wn31mrG7udrAR2u0nL/VptkcVm4dkoOQU0ggEApiQgNSBtUNb9pXWzJltPwCVR/T+Rl18CfbyN8XBM8XRs0e4Afn0BsC3gyw7wlyXgIa+WBwtcb39nAP6HioGeh099i/dBocGuKn/+MPObBwCvY9R1l3md6BwTz2MMEW9Gzo8zsyBmQUSwMVEjnr9f2lPtSCtphONuBUcpdwje9mRie5ffNIW7xcS2jN2V7PXZ6JTyc/HG4lR4h1BgHgHahClhcWUFAla1Q2oe7HU6YYdOuQinXu5Tr8BJ528nTPRaZ/1x6E6ZdqqSb6QNcmWosFLWoimo5PTx+7nVglhhTUSUBix2hfiCArwruDYpBjItplAgg7SbuEGMtaVmJLfYppw1rkcHbx32ClnbjbIMwgY15qg7JOmNsRKAnNxCjZzXYkwAjEHQNImnOMGlcVBBzwd6mgUtYK2HrNsE+S29/urVkf1aOogLubMr1JIvqbA1EwOM7qbRO9h2G0ZuQ3azmBgOhYm8QmF7b10FJMVu62nKwXJKNeW31ru6+2VkTuAnk/E725PdkO2SItluLBM7xC5CFFVluVRFmUSnxgcoBaAOwGTz/0O0/wX4jOZ1gepz1HIO8eEC0V9R8y8/Cc2vzFx8tQI8NBavG8Df0gGQ8uCFG+x9DfhUa9gA+bwDuO4A/nzspR92Pf/5FLG9zfP5GcAYAeJNgHwYNAviDjmd7IAmxKEDYOwPWAGZZn3fqckJcDTlplIYpbBbODeSv22yg8neQ3ZbsneS3ZjcFLwKDouucIiCZNqEBik28MxOA0dcbJy/0Zu2zSfswcn7sPn8Onn3ecs8ZmbPMx2YIl1RR9aL6i39oExBrQpdYERTmHxn8jCl8AAKAnicUHgrx8VaXAwAX3ibRgV9GooQx1KGFqBR5fpjx2IRiINrhdgEY6aIWAAo0uWEIkbyrNvxpRPnKQKkpTsymHQKfKEaqoRqvJCwycZQ0UC/xMYGG1vcucUdK9yxUhP3tG1XRi6H8X34OU4cgrdvPmxvLigH6LQbApDgHR+mAAUqtQkCWWynviSZE8qcb3qOy0f8d/lSrQX9OlIGtpfvgl2dXcmiQadQaCY2QjoqM9mkKuwCagALgGPzwMjnAXwC6Eua6z+Bv/DfFB9PqX5cAn5hDvg4Z/5sRnq3BnzYAh6bq+XBEe9l/0gERfmaz/9W+UCa8wDwvDe+fDlQ8f0h4+37zNuPSNfh/5qtAjQDtAcg+mxzBxCBCscIxBhOScCo6GoGjVBsupjcefprOZPkDuDcS34b8ocHuZ0r7Jx7bYbHkr81Y0P6Y3lVKtoKsGyPzLE20jXr2msEheOILSL0CDbM55ZtY8vl0yn7cNru5eRdbeMMf0IzExfV2xRHPRyNKNlXmVIqqAJJW5P1qt2iA5+0kSBXAiqx3FPOcRhfHqG3d4pwSO4IxIS94PsJgAX0vKU0smDapGvM0k0FhzaigDEczacOYdn1kYlcdRx6EdZ48Gwr7EdoXaLcUut63Id8TKNWVEtHU3VGAzXW9ttP1/Z1bV3keSfGBScuF7xZj3rjctFr2HGq9N7o6khQDAGBzYBMhWDQ5ChFOfRWqhaVSsrIPp56z6T3IvSeF+uopNcbtTqoPlnrKbUymd79ndMuKos1EYJ8CglQTBBUl1Hl9gqK7cfIZlsA80rUqQUsibLUaU3tpz/A+sXPE3/zWM1fnVjjz04/0P/oX59/jf6hf7ObKt52tTw440v4XxmAP+x5/kWF2AaebVeQ3xzp+OMx+9sY7bqr7Tb2OCfE7X2e4yek++BTfBoosU2oCTkhIgEV8o9jhKSIKIDkWUCRG+HP6NWQF+RH40yTs5+ccfWXd286977kJpPbLwoHlxtSdt5tP7vtWHa0CdtY01U2OGBx0VvbL6RWfrwK/XRqxTOjmNkRJ+zeTtrjjXvPJ5znzbP8Ota6mu2MH6Hqqqas2TYVY1QfRLdUq5oRTVK3UhVOvjOogjVMYcv1yKyc08kS9ipjQizWVAHo+TJ2klGIElKSNGnlyUoSZ0lMNghxcJP4gBIh9oVYW95+r7asoVLD/ptYq5HSw7IN5K1suqciIvsL2xhg5/rYuaWdm7Gwqp0bvOikL3w1zz64nX84/tcLK/HNf5OnH2mY2u3Y3l4SoqhGgEmSkAkkstF82fZqynSQWg2ZZUqvpOd4R6fTn8hehtQypTLZyf1qVFtUVygbOzf7jxEFaaK23NpmswQhIoDb+4bXAvwOhP+ebvxlwHqBeFhAXE6R64zjaa79y0368JM7iJ++TvXLDeC6Bfz69jOXB4cU6Dn4O4ArTGosakxHyl4zanK80l6vtZjKbKQlI6vUSDWwRfLFJrbzV/yVKIvIHoiGuT37BZ++TgS+87Qz/ivEf8FNnlD7hRj9C5zxV0PtZ6b2zsUPIt5D5a0rv2sq76vao6udm/QMOjNNAtjYopMggsnG2oBosAvPVxEnsnGfq8AK0pGwsmwPmSz4SDJHU18LvUeuf5XS69TTUrqFb1aqAZUKtUTJKSNlSTk8Hy09FimYSk18qT6/UhVmINHhI3sNE0IpH67dXm22pR6YwJfETyRqJpKIL5c5yZYOVKvspYYRVqRTnNMmxR2RlrkGCnletMQjcVAVY5MY0rNIB1U9kcoZqkMo7ZrSuSmNpngy8UDSS3AjSRtzLUkFr46D3blFmBg8FcZh8F4gp7cXBBCZbzHsXeaKFFYuu2X5l+zTDa4h3IzCzoTLyQdmFvCBfY1hDUEw0yfnSBE/rsAQpDWqEq3pWYX8hlWM5YcEspiFyp9ZsNuKheFjgjmo07W1tHNXV0HfUAdWXYOjXcMYcsrAAZA3UMrPwj/gIuE/cINhp6pFWiMTcziJJtNoPonnYKola1F62HTLRM2agiUFNY8teYmW8JJzq8zrrZErex5C1fTLRmCSo/xAN3OB2n9KPJhk5+whJI9Jslfp2cUfkl+++pjFj9XbV/sQkj386MmxsYP7QzXBa2O2GZrdLyScYdeMBsBmz14T7HaATIEncHoUNkQ5WblYrVgdpAh2mjKJ6Ai+TSontZywJWzLH5cSkA/KDTUGM1lWME8f4RdspUCN/J6JhVDIyhIaEYnMMABN9rIKsFyxS9pTaKYOAiAYWRI5JEnTF3ZoliRqH/EIEHBD6RneDFrFM/BoNOi5PIurnVtcYQRvCt89dwZvpj/pj79QRU/wicRNfJe1EdLJ6QDJTKyItiAJQ2Iz0VQFFfN+bJiFSbJm20goZp8EOTPoSLQk2Q3JrkjmymWuTbRUwdaF6x1Zu2DVfNnm2rwRUSVRgf/C9Ew6MKFMcRcKzFNsVkASxCQE4woBYsd9qpIJ6G7DBy02Q7MpWbgr6n9W1g6GtTaY8QJrXeCnJmzDXn3szz4M+31yaLxeG84KN8sbMK+Cb3Sy3xCwG0b+jWE3zzZht8+nqhTaOHFVq53GLluLzGLDhMj5ofIQ0hYj/s9YxSJCAklGDQjnzu7IqJmZXy8aBspXLrMtKEHTuMbSKegFfp7qEZKTSo/Ovof0lNQeIH408QHiB2HfmeqZfN/J0aUnl16q9ATpmbjRuRk0lAICuWL4OcKQ7VW2EpRRoK2Ayg2AQQ6bCkIQhlQQxagw5saH/AHelLyQB9UU7IX6XWol2IHdB9W5n+RP0mpJpfAdxAYwkXL4fKmhN7UawSxoFAZMOCRaCQQlLuUPe80/U4/ptTwlqIkreYKH6xncUhyIMxu3JHckdyi/W3dqjiRckofy39iDAYziObGRJpASsAgKhCkTgIzPLvjmvpWV13EFKcZUjiYQSAgj8jpFVXwc7+9vY9YhunHRhgRX5lcMroi5GQQrE/Yh6MH0KlhWQQFU9lp9/kYhyCAiC1qIwDQAojxv6zClIOb9nw2jBdRMQJqwuiOtqcoiGmz863T4rS17ZKtUR+IMOkOm8EkKlo77w/+p+L+Z7OKJ2ei0f3G1nzdOBG/0VH8IOKdT/zaOO3vcpp09jk1ckxanTqSzS0txJjGaVYpS/Zko1pJr5LMDPuOjQSJvXDx3Hn6RgKlq2MMNDAt7RlwzCrksHSvbIBnBnkJ6CumJ2KP6tOJDSPcivTB7EukFPh/7lMVPJP3gqruq8uTSo/jendlbci1ahWlcS0wo3fRcDYgwCmlaKS2C0a0AV9u1bLpLJ1YioGm/CUBAScgAPTBgeZYRyMqP5sAJsABuIJVTgQah3IkYAjRCNAuSI1qJQhZAoEOgJt83cyzYgyFHtOhAdQ+giCbMzzLLYjgp2ihY3hFUjYSuBIQSkYMGuAQBE+0zTVYsLJAzlXxuUWnCBcuuWWZFwisIbkbBJgTbJlw2X2PQG1m6H056CDrydZpF+NzOkRAGNrQ41t7S2nZg0bdUSJq1hheBuN/PcQegmwCvglgAXoK+hruayjXQhtYetl8PuXJrvH047T+ottoujPzn692/jGi25Y2j6u+GfoU2vRtdwrTBpI3nQivTtkw3jtrrlXhd0ERIEI0kB2s0mrco2AkNefgrE9m33Pn31G5jszXe9J4Gm40FdA6a4fexk7NTYyf25/9Udgy/mL0wnJWOKj0zd8zSi7N7KMymcBBvZwqgj6QQ5Er0XNxa3KHoXfLm4MXw+lxJk1pQQrkILNF2QwLDLJWD5V2a6QAIgHKkEUkgC9LcUW3uDL4J101JGZjKC2bPbgoIDIIAiUQrJtYEiYGiLSGKCBiFIapE3RYa7CJSpTPXCrtT5GQ5PZawF+ECzJLIEsKePQxZma8x7CBcNO+ZrCdm2ZhlkCvHteOyMnViOuCK/EkR4pNkB0EII2UQEgThTJKDrR3jnmIqtociJNKPtyZ+4p94wgPeV9ExoJZwq0qtklpVl0r5HuLwN6Lh9FS0uBA/d646mov7BTitQwb8FRq94VSF5nAA/jP0hH1hJTSGQ6vdGKtpZpExSTNZzTCfxM0jjVxbJt9nYhsErmJalCS4xlZAvTdlH2yab/vBjbt9W3GaTqEY2zr3I69AoIaNinGAg6iFjm7qPfgsPJVfvd4HryQ9NU41XoGP5BvvDc6txgnQA3wi3ij/Ml0aPdLv7TP+njsTeEOpuipQiGuBAI2y9/ZncCle0L/pWQB6y/r+mQ5AgDAbxExgpdlQgjmEHOkEgqDrq4IoQhKQaR5GSkUJblOUtz5BZtjL1KdEDm+tnCxONgqmQr2jRuw+qYZwAT/IP+67or5YfeHNJOzID2B6J8tgls5U+NXPCUWwIgFCxIwIBaxsXsLcfZYNYFhhhEtptm1FTKkCVfATfrhFxAQQF8LUaXCj4vyRXMlUOXeARFVSlX/WePGbzNkF3Z266M4MmGvzpcNPMzo+BydrkBIcdaBPoLkPV9q3vYFV/cSwFdCPcWbJcr62HMQRIRUON+O0p7JkxEhETCIJ0ljqCMSIwjfA9BKwAM25Gx/SPgGekhN7UlAE0hOiWB5SoNNZ9nvVsG/rrFeHuwSzrAQhx12m4zyV19JBX5oL4LlokK4JJuEqIPdIDgKYK2EgHcmbhIeOZ/ghvt6fGav5j7MNmuHQ474ALvAO9SzP+AK8ofxB3TF4xXzvnsEhWglFFMAAdhARYKh/HMSgsrFaecjSbVYyP1zLALNRNmEj3MK/TxkQJ0rpSUTSVsCDsvTnUzn8JbBP2AXwCdt0Y42dOBFWeMgbY0kiGNSYIn4KA6z8wgzyVN6Os1cgseJXvG/7TX5He7+KbW+qIxlsegdRLVWxvfUTzwF9VyXfovVUkleQLFSyArIC0ih9rSx+zPrgZjQ+XytHK9HB+lMCpQHvaQG6SX9KWRWGTw3HIiaGEBFrLBJCk/BsQi7Gqe/+Ehg/7bCSWCnsC/VYiPeFC6+EKJRWqVDC2IDiCbUPVuCwvMlDrrl8oQPRbE0rhhJefBQgCpNizXR4mk20BogELE0kzDapwMHbNeAecHqHLPE4eRF26pqqmtDQKnv/oI+F2VwpRGCW52gkqPJ21SxvF6ZigGKaHIMgzfPjFTACL5AKOGAz/Wf2oYtoFjZghx9aLbrxDjT5liW3GaLs3k1O6GknAZASPK1dqh2UwwKjyA4I/I6W98vTKGzWf72EjaiIGLlfIZ0dKgHDwe0ejg7QB+J0/ikB6ZjcQtIo0iFKR1LD1E5LBudXoeNfhl6ZhfPhEswX4KgGhzW414CDGqR256Q/xa16v7DGET8oHPyd63XQt67WLp+qeTb+3IcKyntqHwMe/w5Q65NhANc+uB2ofAieDVM2k4TNiN49A9vfVvljk4ozbgioEMBDQR/YQDH72s1lEsZ8EFCE1cAIcwKIuQIU2BBMkEmJ2ACU6vtMcXEaRWFotEFYrj52gZmkVGxADT6I5mc4AINun4sYIRATGAYgynK8svIkAiQHDiTdYEm6CKkFSdwRI/4SCfbOVYNAxFSCJknZ9BPbfXPrFRMjE8OtHSPDbQgBoga+Ipzf6YZfVqVan6VK/5N4+dNwXtXgqDbtcA71S9DVPyg8W4LFCsxqkBcgnR2NNs/r8nfls9v97Nz7Mrf/mEf7Jif9KXjVES/7v/y7RVCPY/WdBdVK26yQ4CKdr8t4tMLlWF7rp6dV97WWKTeb1rsnnHebZKxALQn6ojr8HSwYQPpFxf+aMlYHf3rILU8R+PKPIaeO7AAMx5BpVk6yBRGZlGIYiERGxARigtWyzDJApBZIJMU4FFPuYgAjSVPEBOGctJJIRFuZSnyR2CAFVGrSKS1IuYWQOPETqfg7RUzrfrd6DTGz45u534mJz3Fi9nO8X1pNqDKNnKr4Fo3fBjQHUtNpreK1Sldvk5KWMh++F/HiyS3yql0XtcvksnVICw66jMa2wv22S5fdOo67q8Wjbqc/hbH6uwvgBbhXASvBtgeu+mA9cIx9m5efArd/EdoMnMdQxvgmSA1xLZwcGUvALNoj/guAqkhHxZwVIAqzql+AdnuAgRsnMBiAw95Op3aqYzoUZcVMMqGxKp3nM5CfPitJIJMlIRO/KNFcGLZlhgFi6kFigqJItCyzJRGR7QYhInWdZO4qWW60m6Z100q1UqqypWt+JBCHJH6kgRZwu1Ms3RcMtP3H3gdAiUwdyR2UE6QWkSFLwrOO0YVq8a0gn/tjcrYQpxUoa7Bag+UaTA347jX4CQmQ/hTMH7334H8HWADXAebxOwAbOabKERXxEkQBdmGYCkuraOsBqwfYK23XPoLD39XvChA9D9e+9hh5Hl8A5qeveKvO8592yxVP+093/tMl7YgpiqS9AiMceDrVKjrl3r87keC62py5wogkskcmu6JRRPwoKVZNJxDxRYoSimxvhABsATgHsGFjMmAeyFz9MyUI+bSZSpQBWF75boFKo61hmCmA10D+/4jDZTjLStyt70xSDbqVC12LefUpvQ+q1HwC74NKW5C6Xzto3ICyBPPVJ/DGgAHYAD8y/aQ/JfRHfxH4YoAU4C6+vSe79lGArpCoQbwGMoOIgtxKHt8XIgMZpYet0hk9qM/XtB9X2FGojsIehVQFwOqjRaAHmBXiqABRAbKHiJ5mFMAEygpsFkYWQJTHaGJfW/sxqx74+DshM0gQPP+QiBiRoCuHTDBVM8Wr9kqlHlQQ1KpBANJV4mq8F8jXIfTbSniFIAwAsdNuLUIdCi1SLcBaJrsf6Q03MNR+v7WpfbdIdEh2DrQufBbk/F6Qx6t+Ty2VOqUkVTJQ1ymaDnSOZae0dMwyq03mJAkO88P9csH7O+8n/Sm6GVUA1wLYA/B9ASyRxQ8F2QI5CvLeQ2b5KXy0gK3COCrPK8CPgGAgZvnZATNsZXHtOim0t88z324yZvfRAioRig4jglFxBWhq+aE0q3sWgJOPgmax044CqRlARdEAlOV3ixJkS/Np/8E+NYAHyG6r+vR3PfPT3bwxSUt+agB1jNb9PdDXDtXaf8WXyTi1jGoZ5+5zyHBt3y1gJOBjgm0LLhJ8OCf9KdSfLl8bf4JPB6B6NuDbANzK037Uv+Jj3wHATi4bYAAL+dqwCtgCYCEib/49OmYASwd4D3DuAB/yk736Mx/Gc7eW71O+Nr5aHrz+E5Sny9Pl6xCvFrla5Gr5uvv/VfF/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n/yf/J/8n8SMQ==",
    eyebrow:  { text:"JERSEY ADVERTISER",  color:"#166534" },
    headline: { before:"", highlight:"Ernie's", highlightColor:"#166534", after:"", headlineColor:"#166534" },
    sub:      { text:"Jersey's leading supplier of Tools, Agricultural & Automotive parts & accessories", color:"#14532d", wrap:true },
    cta:      { label:"Visit us", labelColor:"#166534", url:"ernies.je", urlColor:"#166534", arrowBg:"#166534", arrowColor:"#ffee00", boxBg:"rgba(22,101,52,0.12)", boxBorder:"rgba(22,101,52,0.5)" },
    stats:    [],
    statColor:"#166534",
  },
  {
    id: 4,
    link: ENQUIRY_TRIGGER,
    bg:       "linear-gradient(135deg,#0c1445 0%,#1e3a8a 60%,#1d4ed8 100%)",
    eyebrow:  { text:"SLOT AVAILABLE",     color:"#93c5fd" },
    headline: { before:"Your Business. ",  highlight:"Here.", highlightColor:"#93c5fd", after:" Jersey's shoppers.", headlineColor:"#f0f4f8" },
    sub:      { text:"Limited banner slots — enquire now", color:"#bfdbfe" },
    cta:      { label:"Reserve this slot", labelColor:"#93c5fd", url:"jerseybasket.je", urlColor:"#f0f4f8", arrowBg:"#3b82f6", arrowColor:"white", boxBg:"rgba(59,130,246,0.15)", boxBorder:"rgba(147,197,253,0.4)" },
    stats:    [{ val:"Only 4", label:"slots total" },{ val:"From £99", label:"per month" }],
    statColor:"#93c5fd",
    accent:   "linear-gradient(90deg,transparent,#3b82f688,transparent)",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   INSTALL STEPS — reusable install instructions component
═══════════════════════════════════════════════════════════════════════════ */
function InstallSteps({ accent = "#22c55e", compact = false }) {
  const ua = navigator.userAgent.toLowerCase();
  const isIos       = /iphone|ipad|ipod/i.test(ua);
  const isAndroid   = /android/i.test(ua);
  const isSafari    = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
  const isChrome    = /chrome|crios/i.test(ua);
  const isInAppBrowser = /fbav|fban|instagram|twitter|line|wechat/i.test(ua);

  const [tab, setTab] = useState(isAndroid ? "android" : "iphone");

  // Wrong browser warnings
  const wrongBrowserWarning = () => {
    if (isInAppBrowser) {
      return {
        show: true,
        icon: "⚠️",
        color: "#f59e0b",
        text: "You're in an in-app browser. Tap the ··· menu and select \"Open in Safari\" (iPhone) or \"Open in Chrome\" (Android) first.",
      };
    }
    if (tab === "iphone" && isIos && !isSafari) {
      return {
        show: true,
        icon: "⚠️",
        color: "#f59e0b",
        text: "You need to open this page in Safari to install it. Copy the link below and paste it into Safari:",
      };
    }
    return { show: false };
  };

  const warning = wrongBrowserWarning();

  const iphoneSteps = [
    { icon:"🧭", text: isSafari || !isIos ? "Open jerseybasket.je in Safari" : "You're already in Safari ✓", done: isSafari },
    { icon:"⬆️", text:"Tap the Share button at the bottom of Safari" },
    { icon:"➕", text:"Scroll down and tap \"Add to Home Screen\"" },
    { icon:"✅", text:"Tap \"Add\" top right — the app icon appears on your home screen!" },
  ];

  const androidSteps = [
    { icon:"🌐", text: isChrome || !isAndroid ? "Open jerseybasket.je in Chrome" : "You're already in Chrome ✓", done: isChrome },
    { icon:"⋮",  text:"Tap the three dots ⋮ menu in the top right corner" },
    { icon:"➕", text:"Tap \"Add to Home Screen\"" },
    { icon:"✅", text:"Tap \"Add\" — the app icon appears on your home screen!" },
  ];

  const steps = tab === "iphone" ? iphoneSteps : androidSteps;

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://jerseybasket.je")
      .then(()=>alert("✅ Link copied! Now open Safari and paste it in the address bar."))
      .catch(()=>alert("Visit: https://jerseybasket.je"));
  };

  return (
    <div style={{ width:"100%", marginTop:16 }}>
      {/* tab switcher */}
      <div style={{ display:"flex", background:"rgba(0,0,0,.3)", borderRadius:10, padding:3, marginBottom:12, gap:3 }}>
        {[["iphone","🍎 iPhone / iPad"],["android","🤖 Android"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:compact?"5px 0":"7px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:compact?10:11, fontWeight:700,
            background: tab===id ? accent : "transparent",
            color: tab===id ? (accent==="#22c55e"?"#052e16":"#0a1628") : "rgba(255,255,255,.5)",
            transition:"all .2s" }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* wrong browser warning */}
      {warning.show && (
        <div style={{ background:"rgba(245,158,11,.12)", border:"1px solid rgba(245,158,11,.35)", borderRadius:10, padding:"10px 12px", marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ fontSize:compact?10.5:12, color:"#fcd34d", lineHeight:1.5 }}>
            <span style={{ marginRight:6 }}>{warning.icon}</span>{warning.text}
          </div>
          {tab==="iphone" && isIos && !isSafari && (
            <button onClick={handleCopyLink} style={{ padding:"7px 12px", background:"rgba(245,158,11,.2)", border:"1px solid rgba(245,158,11,.4)", borderRadius:8, color:"#fcd34d", cursor:"pointer", fontSize:11, fontWeight:700 }}>
              📋 Copy jerseybasket.je link
            </button>
          )}
        </div>
      )}

      {/* steps */}
      <div style={{ display:"flex", flexDirection:"column", gap:compact?5:7 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
            background: step.done ? "rgba(34,197,94,.12)" : "rgba(255,255,255,.06)",
            border: step.done ? "1px solid rgba(34,197,94,.25)" : "1px solid rgba(255,255,255,.06)",
            borderRadius:9, padding:compact?"7px 10px":"9px 12px" }}>
            <div style={{ width:compact?26:30, height:compact?26:30, borderRadius:7,
              background: step.done ? "rgba(34,197,94,.25)" : `${accent}22`,
              border:`1px solid ${step.done?"rgba(34,197,94,.4)":accent+"44"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:compact?13:15, flexShrink:0 }}>
              {step.done ? "✓" : step.icon}
            </div>
            <div style={{ fontSize:compact?10.5:12, color: step.done?"#86efac":"rgba(255,255,255,.85)", fontWeight:step.done?600:500, lineHeight:1.4 }}>
              <span style={{ color: step.done?"#22c55e":accent, fontWeight:700, marginRight:5 }}>{i+1}.</span>
              {step.text}
            </div>
          </div>
        ))}
      </div>

      {/* direct link button */}
      {!compact && (
        <a href="https://jerseybasket.je" target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:12,
            padding:"10px", background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.28)",
            borderRadius:10, color:"#22c55e", textDecoration:"none", fontSize:12, fontWeight:700 }}>
          🔗 jerseybasket.je — tap to open in browser
        </a>
      )}

      {!compact && (
        <div style={{ marginTop:10, fontSize:10, color:"rgba(255,255,255,.35)", textAlign:"center" }}>
          No App Store needed · Works offline · Always free
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WELCOME SCREEN — shown once to first-time visitors
═══════════════════════════════════════════════════════════════════════════ */
function WelcomeModal({ onDismiss, onSubmitPrice }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      emoji: "🛍️",
      title: "Welcome to JerseyBasket.je",
      subtitle: `Join 950+ Jersey shoppers saving money every week`,
      body: `Compare prices across all ${BASE_PRODUCTS.length} products and growing — find the cheapest price on every item and build your shopping list before you leave the house.`,
      bodyJsx: true,
      bg: "linear-gradient(135deg,#052e16 0%,#14532d 50%,#16a34a 100%)",
      accent: "#22c55e",
    },
    {
      emoji: "🏆",
      title: "Always the Cheapest Price First",
      subtitle: `${BASE_PRODUCTS.length}+ products across ${STORES.length} stores`,
      body: "Every product shows you the lowest price available in Jersey right now. Tap the store pill to compare all stores — or pin one store to see all their prices at once.",
      bg: "linear-gradient(135deg,#0c1445 0%,#1e3a8a 100%)",
      accent: "#93c5fd",
    },
    {
      emoji: "🧺",
      title: "Build Your Shopping List",
      subtitle: "Smart basket with savings calculator",
      body: "Add items as you browse. The basket automatically works out which single store is cheapest for your whole shop — and shows exactly how much you'd save.",
      bg: "linear-gradient(135deg,#1a0533 0%,#581c87 100%)",
      accent: "#c4b5fd",
    },
    {
      emoji: "♥",
      title: "Save Your Favourites",
      subtitle: "Heart items to save them for next time",
      body: "Tap the heart on any product to save it. Your favourites have their own basket — add them all in one tap every week. Your regular shop, sorted in seconds.",
      bg: "linear-gradient(135deg,#450a0a 0%,#991b1b 100%)",
      accent: "#fca5a5",
    },
    {
      emoji: "📱",
      title: "Install it on Your Phone",
      subtitle: "Works like a native app — completely free",
      body: "Add JerseyBasket to your home screen in seconds:",
      bg: "linear-gradient(135deg,#0a1628 0%,#0d1f38 100%)",
      accent: "#22c55e",
      installSteps: true,
    },
    {
      emoji: "🏆",
      title: "June Price Hunt!",
      subtitle: "Win a £10 gift voucher",
      body: "Help us verify prices across Jersey's 5 supermarkets — and win! Submit prices from your shopping receipts throughout June. The shopper who submits the most verified prices wins a £10 gift voucher. 🇯🇪",
      bg: "linear-gradient(135deg,#1a0a00 0%,#7c2d12 60%,#c2410c 100%)",
      accent: "#fb923c",
      competition: true,
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.85)",backdropFilter:"blur(10px)",padding:16 }}>
      <div style={{ width:"100%",maxWidth:460,borderRadius:24,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.7)",display:"flex",flexDirection:"column",maxHeight:"90vh" }}>

        {/* slide — scrollable content area */}
        <div style={{ background:s.bg,padding:"40px 32px 32px",position:"relative",flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
          {/* skip button */}
          <button onClick={onDismiss} style={{ position:"absolute",top:16,right:16,background:"rgba(255,255,255,.1)",border:"none",borderRadius:7,padding:"4px 10px",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:11,fontWeight:600 }}>
            Skip
          </button>

          {/* emoji */}
          <div style={{ fontSize:64,marginBottom:20,lineHeight:1 }}>{s.emoji}</div>

          {/* title */}
          <div style={{ fontSize:22,fontWeight:700,color:"#fff",marginBottom:6,fontFamily:"'DM Serif Display',Georgia,serif",lineHeight:1.2 }}>
            {s.title}
          </div>

          {/* subtitle */}
          {step===0 && <style>{`@keyframes goldpulse{0%,100%{color:#f59e0b;transform:scale(1);box-shadow:0 0 8px rgba(245,158,11,.4),inset 0 0 8px rgba(245,158,11,.1)}50%{color:#fcd34d;transform:scale(1.04);box-shadow:0 0 18px rgba(252,211,77,.7),inset 0 0 12px rgba(252,211,77,.15)}}`}</style>}
          <div style={{ fontSize:12,fontWeight:700,marginBottom:16,textTransform:"uppercase",letterSpacing:"1px", ...(step===0 ? {animation:"goldpulse 2.8s ease-in-out infinite",display:"inline-block",color:"#f59e0b",border:"1.5px solid rgba(245,158,11,.7)",borderRadius:20,padding:"6px 18px",background:"rgba(245,158,11,.08)"} : {color:s.accent}) }}>
            {s.subtitle}
          </div>

          {/* body */}
          <div style={{ fontSize:13,color:"rgba(255,255,255,.8)",lineHeight:1.75,whiteSpace:"pre-line" }}>
            {s.bodyJsx ? (
              <>
                Compare prices across all{" "}
                <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:16, fontWeight:700, color:"#ffffff" }}>5</span>
                {" "}Jersey supermarkets instantly. Over{" "}
                <span style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:16, fontWeight:700, color:"#ffffff" }}>{BASE_PRODUCTS.length}</span>
                {" "}products and growing — find the cheapest price on every item and build your shopping list before you leave the house.
              </>
            ) : s.body}
          </div>

          {/* install steps — only on install slide */}
          {s.installSteps && <InstallSteps accent={s.accent} />}

          {/* competition leaderboard — only on competition slide */}
          {s.competition && (
            <div style={{ width:"100%",marginTop:16 }}>
              {COMP_WINNER && (
                <div style={{ background:"rgba(251,146,60,.2)",border:"1px solid rgba(251,146,60,.4)",borderRadius:10,padding:"10px 14px",marginBottom:12,textAlign:"center" }}>
                  <div style={{ fontSize:11,color:"#fed7aa",fontWeight:700,letterSpacing:".05em",textTransform:"uppercase" }}>🎉 June Winner</div>
                  <div style={{ fontSize:18,fontWeight:900,color:"#fff",marginTop:2 }}>{COMP_WINNER}</div>
                </div>
              )}
              {LEADERBOARD.length > 0 ? (
                <div style={{ background:"rgba(0,0,0,.3)",borderRadius:10,overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px",fontSize:10,fontWeight:700,color:"#9a3412",letterSpacing:".08em",textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                    🏆 Top Shoppers — June 2026
                  </div>
                  {LEADERBOARD.slice(0,5).map((entry,i)=>(
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:i<LEADERBOARD.length-1?"1px solid rgba(255,255,255,.05)":"none",background:i===0?"rgba(251,146,60,.1)":"transparent" }}>
                      <div style={{ fontSize:14,width:20,textAlign:"center" }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                      <div style={{ flex:1,fontSize:12,fontWeight:700,color:"#f0f4f8" }}>{entry.name}</div>
                      <div style={{ fontSize:11,color:"#fb923c",fontWeight:700 }}>{entry.count} prices</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background:"rgba(0,0,0,.3)",borderRadius:10,padding:"16px",textAlign:"center" }}>
                  <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.6 }}>Leaderboard opens 1 June 2026.<br/>Be the first to submit! 🚀</div>
                </div>
              )}
              <div style={{ fontSize:10,color:"rgba(255,255,255,.35)",textAlign:"center",marginTop:10,lineHeight:1.6 }}>
                Submit prices via receipt photo · 1–30 June midnight · Winner announced 1st July 12:00pm · £10 gift voucher
              </div>
            </div>
          )}

          {/* decorative glow */}
          <div style={{ position:"absolute",bottom:-40,left:"50%",transform:"translateX(-50%)",width:200,height:200,borderRadius:"50%",background:`${s.accent}22`,pointerEvents:"none",filter:"blur(40px)" }} />
        </div>

        {/* bottom controls — sticky so always visible */}
        <div style={{ background:"#0a1a30",padding:"20px 24px 24px",display:"flex",flexDirection:"column",gap:16,flexShrink:0 }}>
          {/* dots */}
          <div style={{ display:"flex",justifyContent:"center",gap:6 }}>
            {steps.map((_,i)=>(
              <div key={i} onClick={()=>setStep(i)} style={{ width:i===step?20:6,height:6,borderRadius:3,background:i===step?s.accent:"rgba(255,255,255,.2)",cursor:"pointer",transition:"all .3s",boxShadow:i===step?`0 0 8px ${s.accent}88`:"none" }} />
            ))}
          </div>

          {/* buttons */}
          <div style={{ display:"flex",gap:10 }}>
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ flex:1,padding:"12px",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.2)",borderRadius:12,color:"#7dd3fc",cursor:"pointer",fontSize:13,fontWeight:700,position:"relative",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08)" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"12px 12px 0 0",pointerEvents:"none" }}/>
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? (s.competition ? ()=>{onDismiss();onSubmitPrice&&onSubmitPrice();} : onDismiss) : ()=>setStep(s=>s+1)}
              style={{ flex:2,padding:"12px",background:`linear-gradient(180deg,${s.accent} 0%,${s.accent}99 100%)`,border:"none",borderRadius:12,color:"#052e16",cursor:"pointer",fontSize:14,fontWeight:700,position:"relative",overflow:"hidden",boxShadow:`0 3px 12px ${s.accent}66, inset 0 1px 0 rgba(255,255,255,.3)` }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"12px 12px 0 0",pointerEvents:"none" }}/>
              {isLast ? (s.competition ? "🏆 Enter Competition →" : "🛒 Start Saving Now →") : "Next →"}
            </button>
          </div>

          {/* jersey flag note */}
          <div style={{ textAlign:"center",fontSize:10,color:"#334155" }}>
            🇯🇪 Built for Jersey · Free forever · jerseybasket.je
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELP MODAL — features index
═══════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon:"🏆", title:"Cheapest Price First",
    desc:"Every product shows the lowest available price across all 5 Jersey stores automatically."
  },
  {
    icon:"🏪", title:"Switch Stores Per Item",
    desc:"Tap the store pill on any product to see all store prices ranked cheapest to most expensive — then choose which store to buy from."
  },
  {
    icon:"📌", title:"Pin a Store",
    desc:"Tap a store chip at the top to show that store's prices for every single product at once."
  },
  {
    icon:"🧺", title:"Smart Shopping Basket",
    desc:"Add items from any store. The basket automatically shows which single store is cheapest for your whole shop and how much you'd save."
  },
  {
    icon:"♥",  title:"Favourites",
    desc:"Heart any product to save it. Your saved items have their own basket — add them all in one tap or move them to the main basket."
  },
  {
    icon:"🔍", title:"Search & Sort",
    desc:`Search across all ${BASE_PRODUCTS.length}+ products instantly. Sort by cheapest price, biggest saving, A–Z, or category.`
  },
  {
    icon:"➕", title:"Add Your Own Items",
    desc:"Can't find something? Add any product yourself with prices from whichever stores you know."
  },
  {
    icon:"💰", title:"Savings Calculator",
    desc:"The basket tells you exactly how much you could save by switching every item to its cheapest store."
  },
  {
    icon:"📊", title:"Store Comparison",
    desc:"See how all 5 Jersey stores compare — average prices, which has the most cheapest items, and honest notes on each."
  },
  {
    icon:"📱", title:"Install as an App",
    desc:"On iPhone: tap Share → Add to Home Screen. On Android: tap the menu → Add to Home Screen. Works offline too!"
  },
  {
    icon:"🏷️", title:"Hover to See Full Name",
    desc:"If a product name is cut off, hover over it (or long-press on mobile) to see the full name pop out."
  },
  {
    icon:"🥔", title:"Local Jersey Products",
    desc:"A dedicated category for Jersey Royals, local crab, Jersey Dairy, Black Butter, and other island-specific products."
  },
];

function HelpModal({ onClose, onShare, onReplay }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",padding:"16px" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:580,background:"#0a1a30",border:"1px solid rgba(255,255,255,.12)",borderRadius:20,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden" }}>

        {/* header */}
        <div style={{ padding:"20px 20px 0",flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4 }}>
            <div>
              <div style={{ fontSize:18,fontWeight:700,color:"#f0f4f8",marginBottom:3 }}>
                🛍️ What can JerseyBasket do?
              </div>
              <div style={{ fontSize:11,color:"#64748b" }}>
                Everything you need to shop smarter in Jersey
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14,flexShrink:0,marginLeft:12 }}>✕</button>
          </div>

          {/* stats strip */}
          <div style={{ display:"flex",gap:6,margin:"14px 0 16px",flexWrap:"wrap" }}>
            {[[`${BASE_PRODUCTS.length}+`,"Products"],[`${STORES.length}`,"Stores"],[`${CATS.filter(c=>c!=="All").length}`,"Categories"],["🇯🇪","Jersey Only"]].map(([val,lbl])=>(
              <div key={lbl} style={{ background:"rgba(34,197,94,.09)",border:"1px solid rgba(34,197,94,.18)",borderRadius:8,padding:"5px 12px",display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ fontSize:13,fontWeight:700,color:"#22c55e" }}>{val}</span>
                <span style={{ fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px" }}>{lbl}</span>
              </div>
            ))}
          </div>
          <div style={{ height:1,background:"rgba(255,255,255,.07)",marginBottom:4 }} />
        </div>

        {/* scrollable feature list */}
        <div style={{ overflowY:"auto",padding:"4px 20px 20px",flex:1 }}>
          <div style={{ fontSize:10,color:"#475569",textAlign:"center",marginBottom:8,letterSpacing:".5px" }}>
            ↕ Scroll to see all features
          </div>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{ display:"flex",gap:12,padding:"11px 0",borderBottom:i<FEATURES.length-1?"1px solid rgba(255,255,255,.05)":"none" }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8",marginBottom:3 }}>{f.title}</div>
                <div style={{ fontSize:11,color:"#64748b",lineHeight:1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}

          {/* install card */}
          <div style={{ marginTop:16,background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",borderRadius:14,padding:"14px 16px",marginBottom:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>📱</div>
              <div>
                <div style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8" }}>Install on Your Phone</div>
                <div style={{ fontSize:11,color:"#64748b" }}>Add JerseyBasket to your home screen</div>
              </div>
            </div>
            <InstallSteps accent="#22c55e" compact={true} />
          </div>
        </div>

        {/* footer actions */}
        <div style={{ padding:"14px 20px 20px",flexShrink:0,borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:10,flexDirection:"column" }}>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={onShare} style={{ flex:1,padding:"11px",background:"rgba(99,102,241,.15)",border:"1px solid rgba(99,102,241,.35)",borderRadius:11,color:"#a5b4fc",cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              ↗ Share JerseyBasket.je
            </button>
            <button onClick={onClose} style={{ flex:1,padding:"11px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
              Start Shopping →
            </button>
          </div>
          <button onClick={onReplay} style={{ width:"100%",padding:"10px",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.25)",borderRadius:11,color:"#ffffff",cursor:"pointer",fontSize:12,fontWeight:700,letterSpacing:".3px" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.18)";e.currentTarget.style.borderColor="rgba(255,255,255,.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.1)";e.currentTarget.style.borderColor="rgba(255,255,255,.25)";}}>
            🎬 Replay the Welcome Guide
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT PROBLEM MODAL
═══════════════════════════════════════════════════════════════════════════ */
function ReportModal({ onClose }) {
  const [form,   setForm]   = useState({ type:"wrong_price", product:"", detail:"" });
  const [status, setStatus] = useState("idle");

  const TYPES = [
    { id:"wrong_price",   label:"💰 Wrong price",          placeholder:"e.g. Co-op Full Fat Milk 2L shows £1.75 but it's actually £1.95" },
    { id:"missing_item",  label:"➕ Missing product",       placeholder:"e.g. Oat Milk 1L is not listed anywhere" },
    { id:"store_issue",   label:"🏪 Store info wrong",      placeholder:"e.g. Waitrose is showing wrong location" },
    { id:"app_problem",   label:"🐛 App not working right", placeholder:"e.g. The basket total is calculating incorrectly" },
    { id:"other",         label:"💬 Other feedback",        placeholder:"Tell us anything you'd like to improve" },
  ];

  const selectedType = TYPES.find(t=>t.id===form.type);

  const handleSubmit = async () => {
    if(!form.detail.trim()){return;}
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({
          _subject: `Problem Report — JerseyBasket.je`,
          type: selectedType?.label,
          product: form.product || "Not specified",
          detail: form.detail,
          message: `PROBLEM REPORT\n\nType: ${selectedType?.label}\nProduct: ${form.product||"Not specified"}\nDetails: ${form.detail}`,
        })
      });
      if(res.ok){ setStatus("sent"); }
      else { setStatus("error"); }
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#0a1a30",border:"1px solid rgba(255,255,255,.12)",borderRadius:"20px 20px 0 0",padding:"22px 20px 30px",maxHeight:"82vh",overflowY:"auto",paddingBottom:"calc(132px + 32px)" }}>

        {status==="sent" ? (
          <div style={{ textAlign:"center",padding:"30px 0" }}>
            <div style={{ fontSize:44,marginBottom:14 }}>🙏</div>
            <div style={{ fontSize:17,fontWeight:700,color:"#22c55e",marginBottom:8 }}>Thanks for the report!</div>
            <div style={{ fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:22 }}>
              We'll look into it and fix it as soon as possible.<br/>
              JerseyBasket is better because of people like you.
            </div>
            <button onClick={onClose} style={{ padding:"10px 28px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
              Back to App
            </button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div>
                <div style={{ fontSize:17,fontWeight:700,color:"#f0f4f8" }}>🚩 Report a Problem</div>
                <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>Help us keep JerseyBasket accurate</div>
              </div>
              <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14 }}>✕</button>
            </div>

            {/* problem type */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:8 }}>WHAT'S THE PROBLEM?</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {TYPES.map(t=>(
                  <button key={t.id} onClick={()=>setForm(p=>({...p,type:t.id}))}
                    style={{ padding:"9px 13px",borderRadius:9,border:`1px solid ${form.type===t.id?"rgba(34,197,94,.4)":"rgba(255,255,255,.08)"}`,background:form.type===t.id?"rgba(34,197,94,.12)":"rgba(255,255,255,.04)",color:form.type===t.id?"#86efac":"#94a3b8",cursor:"pointer",fontSize:12,fontWeight:form.type===t.id?700:400,textAlign:"left",transition:"all .15s" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* product name (optional) */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>PRODUCT NAME <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <input value={form.product} onChange={e=>setForm(p=>({...p,product:e.target.value}))} placeholder="e.g. Full Fat Milk 2L"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box" }} />
            </div>

            {/* detail */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>DETAILS <span style={{ color:"#f43f5e" }}>*</span></div>
              <textarea value={form.detail} onChange={e=>setForm(p=>({...p,detail:e.target.value}))} rows={3}
                placeholder={selectedType?.placeholder}
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:`1px solid ${!form.detail.trim()&&status==="error"?"rgba(239,68,68,.5)":"rgba(255,255,255,.11)"}`,borderRadius:9,color:"#fff",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5 }} />
            </div>

            {status==="error"&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:11,color:"#fca5a5",marginBottom:12 }}>Something went wrong. Please email hello@jerseybasket.je</div>}

            <button onClick={handleSubmit} disabled={!form.detail.trim()||status==="sending"}
              style={{ width:"100%",padding:"12px",background:!form.detail.trim()||status==="sending"?"rgba(34,197,94,.3)":"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",cursor:!form.detail.trim()?"not-allowed":"pointer",fontSize:14,fontWeight:700 }}>
              {status==="sending" ? "Sending…" : "Send Report →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENQUIRY MODAL — friendly in-app contact form, no email client needed
═══════════════════════════════════════════════════════════════════════════ */
function EnquiryModal({ onClose }) {
  const [form,    setForm]    = useState({ name:"", business:"", email:"", message:"I am interested in advertising on JerseyBasket.je. Please send me more information about available banner slots and pricing." });
  const [status,  setStatus]  = useState("idle"); // idle | sending | sent | error
  const [touched, setTouched] = useState({});

  const valid = form.name.trim() && form.email.includes("@") && form.message.trim();

  const handleSubmit = async () => {
    setTouched({ name:true, email:true, message:true });
    if (!valid) return;
    setStatus("sending");
    try {
      // Formspree — free tier handles 50 submissions/month
      // Replace YOUR_FORM_ID with your Formspree form ID (free at formspree.io)
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({
          name:     form.name,
          business: form.business,
          email:    form.email,
          message:  form.message,
          _subject: "Banner Advertising Enquiry — JerseyBasket.je",
        })
      });
      if (res.ok) { setStatus("sent"); }
      else        { setStatus("error"); }
    } catch {
      setStatus("error");
    }
  };

  const field = (key, label, placeholder, type="text", rows=0) => (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:".5px", textTransform:"uppercase", color:"#64748b", marginBottom:5 }}>
        {label}{key!=="business"&&<span style={{ color:"#f43f5e" }}> *</span>}
      </label>
      {rows > 0 ? (
        <textarea
          value={form[key]}
          onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
          onBlur={()=>setTouched(p=>({...p,[key]:true}))}
          rows={rows}
          placeholder={placeholder}
          style={{ width:"100%", padding:"9px 12px", background:"rgba(255,255,255,.07)", border:`1px solid ${touched[key]&&!form[key].trim()?"rgba(244,63,94,.5)":"rgba(255,255,255,.12)"}`, borderRadius:9, color:"#fff", fontSize:12, outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.5 }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
          onBlur={()=>setTouched(p=>({...p,[key]:true}))}
          placeholder={placeholder}
          style={{ width:"100%", padding:"9px 12px", background:"rgba(255,255,255,.07)", border:`1px solid ${touched[key]&&(key==="email"?!form[key].includes("@"):!form[key].trim())?"rgba(244,63,94,.5)":"rgba(255,255,255,.12)"}`, borderRadius:9, color:"#fff", fontSize:12, outline:"none", boxSizing:"border-box" }}
        />
      )}
      {touched[key] && key!=="business" && (key==="email" ? !form.email.includes("@") : !form[key].trim()) && (
        <div style={{ fontSize:10, color:"#f87171", marginTop:3 }}>Required</div>
      )}
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%", maxWidth:520, background:"#0a1a30", border:"1px solid rgba(255,255,255,.12)", borderRadius:"20px 20px 0 0", padding:"24px 20px 32px", maxHeight:"82vh", overflowY:"auto", paddingBottom:"calc(132px + 32px)" }}>

        {status === "sent" ? (
          <div style={{ textAlign:"center", padding:"30px 10px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#22c55e", marginBottom:8 }}>Enquiry Sent!</div>
            <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7, marginBottom:24 }}>
              Thanks for your interest in advertising on JerseyBasket.je.<br/>
              Eamonn will be in touch shortly at <strong style={{ color:"#f0f4f8" }}>{form.email}</strong>
            </div>
            <button onClick={onClose} style={{ padding:"10px 28px", background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)", border:"none", borderRadius:11, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>
              Back to App
            </button>
          </div>
        ) : (
          <>
            {/* header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:"#f0f4f8", marginBottom:3 }}>📢 Advertise on JerseyBasket.je</div>
                <div style={{ fontSize:11, color:"#64748b", lineHeight:1.6 }}>
                  Reach Jersey's grocery shoppers every day.<br/>
                  Banner slots from <strong style={{ color:"#22c55e" }}>£99/month</strong> — limited availability.
                </div>
              </div>
              <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"none", borderRadius:7, width:28, height:28, color:"#94a3b8", cursor:"pointer", fontSize:14, flexShrink:0, marginLeft:12 }}>✕</button>
            </div>

            {/* stats row */}
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[[`${BASE_PRODUCTS.length}+`,"products listed"],[`${STORES.length}`,"stores compared"],["Jersey","audience only"],["Daily","active users"]].map(([val,lbl])=>(
                <div key={lbl} style={{ flex:1, background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.15)", borderRadius:9, padding:"7px 4px", textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#22c55e" }}>{val}</div>
                  <div style={{ fontSize:8, color:"#64748b", marginTop:1, textTransform:"uppercase", letterSpacing:".5px" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* form */}
            {field("name",     "Your Name",     "e.g. John Smith")}
            {field("business", "Business Name (optional)", "e.g. Smith's Bakery, St Helier")}
            {field("email",    "Email Address", "e.g. john@yourbusiness.je", "email")}
            {field("message",  "Message",       "Tell us about your business...", "text", 3)}

            {status === "error" && (
              <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.28)", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#fca5a5", marginBottom:12 }}>
                Something went wrong. Please email us directly at <strong>hello@jerseybasket.je</strong>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={status==="sending"}
              style={{ width:"100%", padding:"13px", background:status==="sending"?"rgba(34,197,94,.4)":"linear-gradient(135deg,#16a34a,#15803d)", border:"none", borderRadius:12, color:"#fff", cursor:status==="sending"?"wait":"pointer", fontSize:14, fontWeight:700, transition:"all .2s" }}>
              {status==="sending" ? "Sending…" : "Send Enquiry →"}
            </button>

            <div style={{ textAlign:"center", fontSize:10, color:"#334155", marginTop:10 }}>
              Or email directly: <a href="mailto:hello@jerseybasket.je" style={{ color:"#22c55e" }}>hello@jerseybasket.je</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS MODAL — store on/off toggles
═══════════════════════════════════════════════════════════════════════════ */
function SettingsModal({ disabledStores, onToggleStore, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#0a1a30",border:"1px solid rgba(255,255,255,.12)",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",paddingBottom:"calc(132px + 32px)" }}>

        {/* header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
          <div>
            <div style={{ fontSize:17,fontWeight:700,color:"#f0f4f8" }}>⚙️ Settings</div>
            <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>Hide stores you don't want to see</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14 }}>✕</button>
        </div>

        {/* store toggles */}
        <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:10 }}>SHOW / HIDE STORES</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
          {STORES.map(store => {
            const enabled = !disabledStores.has(store.id);
            return (
              <div key={store.id} onClick={()=>onToggleStore(store.id)}
                style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderRadius:12,cursor:"pointer",
                  background:enabled?`${store.color}12`:"rgba(255,255,255,.03)",
                  border:`1px solid ${enabled?store.color+"40":"rgba(255,255,255,.07)"}`,
                  opacity:enabled?1:0.5, transition:"all .2s" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:20 }}>{store.emoji}</span>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:enabled?"#f0f4f8":"#64748b" }}>{store.name}</div>
                    <div style={{ fontSize:10,color:"#475569",marginTop:1 }}>{store.note}</div>
                  </div>
                </div>
                {/* toggle pill */}
                <div style={{ width:44,height:24,borderRadius:12,background:enabled?store.color:"rgba(255,255,255,.1)",position:"relative",transition:"background .2s",flexShrink:0 }}>
                  <div style={{ position:"absolute",top:3,left:enabled?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.4)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {disabledStores.size > 0 && (
          <div style={{ background:"rgba(251,191,36,.07)",border:"1px solid rgba(251,191,36,.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:"#fcd34d",lineHeight:1.6 }}>
            ⚠️ {disabledStores.size} store{disabledStores.size>1?"s":""} hidden. Prices from hidden stores won't appear in product cards or the basket.
          </div>
        )}

        <button onClick={onClose} style={{ width:"100%",padding:"13px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700 }}>
          Done
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITION MODAL — June Price Hunt leaderboard + info
═══════════════════════════════════════════════════════════════════════════ */
function CompetitionModal({ onClose, onSubmit }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#120800",border:"1px solid rgba(251,146,60,.25)",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",paddingBottom:"calc(132px + 32px)",maxHeight:"82vh",overflowY:"auto" }}>

        {/* header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
          <div>
            <div style={{ fontSize:17,fontWeight:700,color:"#fed7aa" }}>🏆 June Price Hunt</div>
            <div style={{ fontSize:11,color:"#9a3412",marginTop:2 }}>1st June – 30th June 2026 midnight · Winner announced 1st July 12:00pm</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14 }}>✕</button>
        </div>

        {/* winner banner */}
        {COMP_WINNER && (
          <div style={{ background:"linear-gradient(135deg,rgba(251,146,60,.2),rgba(234,88,12,.15))",border:"1px solid rgba(251,146,60,.4)",borderRadius:12,padding:"14px 18px",marginBottom:16,textAlign:"center" }}>
            <div style={{ fontSize:11,color:"#fed7aa",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase" }}>🎉 June 2026 Winner</div>
            <div style={{ fontSize:24,fontWeight:900,color:"#fff",margin:"6px 0 2px" }}>{COMP_WINNER}</div>
            <div style={{ fontSize:11,color:"#fb923c" }}>Congratulations! 🎊</div>
          </div>
        )}

        {/* how it works */}
        <div style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"14px 16px",marginBottom:16 }}>
          <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10 }}>HOW IT WORKS</div>
          {[
            ["📸","Take a photo of your receipt","From any of Jersey's 5 supermarkets"],
            ["📤","Submit it via the form below","Include your name and which store"],
            ["✅","We manually check every receipt","Store name, date & prices must be clearly visible — duplicates rejected"],
            ["🏆","Top 5 shown on the leaderboard","Updated weekly throughout June"],
            ["🎁","Win a £10 gift voucher","Announced 1st July 2026 at 12:00pm"],
          ].map(([icon,title,sub],i)=>(
            <div key={i} style={{ display:"flex",gap:12,marginBottom:i<4?10:0 }}>
              <span style={{ fontSize:18,flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:12,fontWeight:700,color:"#f0f4f8" }}>{title}</div>
                <div style={{ fontSize:10,color:"#64748b",marginTop:1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* rules */}
        <div style={{ background:"rgba(255,255,255,.02)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:10,color:"#64748b",lineHeight:1.8 }}>
          <div style={{ fontWeight:700,color:"#475569",marginBottom:4 }}>Rules</div>
          • Each receipt can only be submitted once<br/>
          • Receipt must show the store name and date clearly<br/>
          • All receipts are manually checked before prices are counted<br/>
          • Only receipts dated within June 2026 are valid<br/>
          • Prices must be from Jersey stores only<br/>
          • Only new prices not already in the app count<br/>
          • First name + last initial only shown on leaderboard<br/>
          • Competition closes 30th June 2026 at midnight<br/>
          • Winner announced 1st July 2026 at 12:00pm<br/>
          • Winner contacted via the email or phone provided<br/>
          • £10 prize — store of winner's choice<br/>
          • JerseyBasket decision is final
        </div>

        {/* leaderboard */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10 }}>TOP SHOPPERS — JUNE 2026</div>
          {LEADERBOARD.length > 0 ? (
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {LEADERBOARD.slice(0,5).map((entry,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,background:i===0?"rgba(251,146,60,.15)":"rgba(255,255,255,.04)",border:`1px solid ${i===0?"rgba(251,146,60,.3)":"rgba(255,255,255,.06)"}` }}>
                  <div style={{ fontSize:16,width:24,textAlign:"center" }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                  <div style={{ flex:1,fontSize:13,fontWeight:700,color:"#f0f4f8" }}>{entry.name}</div>
                  <div style={{ fontSize:12,color:"#fb923c",fontWeight:700 }}>{entry.count} prices</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background:"rgba(255,255,255,.03)",borderRadius:10,padding:"20px",textAlign:"center" }}>
              <div style={{ fontSize:24,marginBottom:8 }}>🚀</div>
              <div style={{ fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.6 }}>Leaderboard opens 1 June 2026.<br/>Be the first to submit a price!</div>
            </div>
          )}
        </div>

        <button onClick={onSubmit} style={{ width:"100%",padding:"14px",background:"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",boxShadow:"0 3px 10px rgba(194,65,12,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700,marginBottom:10 }}>
          📸 Submit a Price Now →
        </button>
        <button onClick={onClose} style={{ width:"100%",padding:"12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,color:"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:600 }}>
          Back to App
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUBMIT PRICE MODAL — competition price submission via Formspree
═══════════════════════════════════════════════════════════════════════════ */
function SubmitPriceModal({ onClose }) {
  const [form,   setForm]   = useState({ name:"", mobile:"", email:"", store:"coop", product:"", price:"", detail:"" });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async () => {
    if(!form.name.trim()||(!form.mobile.trim()&&!form.email.trim())){return;}
    setStatus("sending");
    const storeName = STORES.find(s=>s.id===form.store)?.name||form.store;
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({
          _subject:`🏆 June Competition Entry — ${form.name}`,
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          store: storeName,
          product: form.product||"Not specified",
          price: form.price?`£${form.price}`:"Not specified",
          detail: form.detail||"No additional notes",
          message:`JUNE COMPETITION ENTRY\n\nName: ${form.name}\nMobile: ${form.mobile}\nEmail: ${form.email}\nStore: ${storeName}\nProduct: ${form.product||"Not specified"}\nPrice: ${form.price?`£${form.price}`:"Not specified"}\nNotes: ${form.detail||"None"}`,
        })
      });
      if(res.ok){ setStatus("sent"); }
      else { setStatus("error"); }
    } catch { setStatus("error"); }
  };

  const required = !form.name.trim()||(!form.mobile.trim()&&!form.email.trim());

  return (
    <div style={{ position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#120800",border:"1px solid rgba(251,146,60,.25)",borderRadius:"20px 20px 0 0",maxHeight:"88vh",display:"flex",flexDirection:"column" }}>

        {status==="sent" ? (
          <div style={{ textAlign:"center",padding:"30px 20px" }}>
            <div style={{ fontSize:48,marginBottom:14 }}>🏆</div>
            <div style={{ fontSize:18,fontWeight:700,color:"#fb923c",marginBottom:8 }}>Entry submitted!</div>
            <div style={{ fontSize:12,color:"#94a3b8",lineHeight:1.8,marginBottom:24 }}>
              Thanks {form.name.split(" ")[0]}! We'll verify the price and add it<br/>
              to the leaderboard within 24 hours.<br/>
              If you win, we'll contact you on <span style={{ color:"#fb923c" }}>{form.mobile}</span>.<br/>
              Keep those receipts coming! 📸
            </div>
            <button onClick={onClose} style={{ padding:"11px 28px",background:"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",boxShadow:"0 3px 10px rgba(194,65,12,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
              Back to App
            </button>
          </div>
        ) : (
          <>
            {/* sticky header — always visible */}
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"18px 20px 14px",borderBottom:"1px solid rgba(251,146,60,.15)",flexShrink:0 }}>
              <div>
                <div style={{ fontSize:17,fontWeight:700,color:"#fed7aa" }}>📸 Submit a Price</div>
                <div style={{ fontSize:11,color:"#9a3412",marginTop:2 }}>June competition · Every price counts!</div>
              </div>
              <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:32,height:32,color:"#94a3b8",cursor:"pointer",fontSize:16,flexShrink:0 }}>✕</button>
            </div>

            {/* scrollable body */}
            <div style={{ overflowY:"auto",padding:"16px 20px",paddingBottom:"calc(132px + 24px)",flex:1 }}>

            {/* name */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>YOUR NAME <span style={{ color:"#f43f5e" }}>*</span></div>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="First name, nickname or alias e.g. IslandShopper"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
              <div style={{ fontSize:10,color:"#475569",marginTop:4 }}>Any name or alias is fine — only this appears on the leaderboard, never your real details</div>
            </div>

            {/* contact */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>MOBILE NUMBER <span style={{ color:"#94a3b8", fontWeight:400 }}>(optional if email provided)</span></div>
              <input value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} placeholder="e.g. 07797 123456"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>EMAIL ADDRESS <span style={{ color:"#94a3b8", fontWeight:400 }}>(optional if mobile provided)</span></div>
              <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="e.g. yourname@email.com"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
              <div style={{ fontSize:10,color:"#475569",marginTop:4 }}>Never shared or sold — only used to contact you if you win 🏆</div>
            </div>

            {/* store */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>STORE <span style={{ color:"#f43f5e" }}>*</span></div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {STORES.map(s=>(
                  <button key={s.id} onClick={()=>setForm(p=>({...p,store:s.id}))}
                    style={{ padding:"7px 12px",borderRadius:22,border:`1px solid ${form.store===s.id?s.color+"80":"rgba(255,255,255,.08)"}`,
                      background:form.store===s.id?`linear-gradient(180deg,${s.color}dd 0%,${s.color}88 100%)`:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",
                      color:form.store===s.id?"#fff":"#64748b",cursor:"pointer",fontSize:11,fontWeight:700,transition:"all .15s",
                      boxShadow:form.store===s.id?`0 3px 10px ${s.color}55,inset 0 1px 0 rgba(255,255,255,.2)`:"0 2px 4px rgba(0,0,0,.3)",
                      position:"relative",overflow:"hidden",
                    }}>
                    <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"22px 22px 0 0",pointerEvents:"none" }}/>
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* product */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>PRODUCT NAME <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <input value={form.product} onChange={e=>setForm(p=>({...p,product:e.target.value}))} placeholder="e.g. Full Fat Milk 2L"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
            </div>

            {/* price */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>PRICE <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#64748b",fontSize:13,fontWeight:700 }}>£</span>
                <input type="number" step="0.01" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0.00"
                  style={{ width:"100%",padding:"9px 12px 9px 26px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
              </div>
            </div>

            {/* notes */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>NOTES <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <textarea value={form.detail} onChange={e=>setForm(p=>({...p,detail:e.target.value}))} rows={2}
                placeholder="e.g. pack size, variant, on promotion, etc."
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5 }} />
            </div>

            <div style={{ background:"rgba(251,146,60,.07)",border:"1px solid rgba(251,146,60,.2)",borderRadius:9,padding:"9px 13px",fontSize:10,color:"#9a3412",lineHeight:1.7,marginBottom:10 }}>
              📸 <strong style={{ color:"#fed7aa" }}>Got a receipt?</strong> Email a photo to <span style={{ color:"#fb923c" }}>hello@jerseybasket.je</span> with your name and we'll count all the prices on it! Make sure the <strong style={{ color:"#fed7aa" }}>store name, date, and prices are clearly visible</strong>.
            </div>
            <a href={`mailto:hello@jerseybasket.je?subject=🏆 June Competition Receipt — ${form.name||"Entry"}&body=Hi Eamonn, please find my receipt photo attached.%0A%0AName: ${form.name||""}%0AMobile: ${form.mobile||""}%0AStore: ${STORES.find(s=>s.id===form.store)?.name||""}`}
              onClick={e=>{ if(!/Mobi|Android/i.test(navigator.userAgent)){ e.preventDefault(); navigator.clipboard&&navigator.clipboard.writeText("hello@jerseybasket.je"); alert("Email address copied!\nSend your receipt photo to:\nhello@jerseybasket.je"); } }}
              style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"11px",background:"linear-gradient(180deg,#fbbf24 0%,#b45309 100%)",border:"none",borderRadius:10,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:700,marginBottom:14,boxSizing:"border-box",boxShadow:"0 3px 10px rgba(180,83,9,.5),inset 0 1px 0 rgba(255,255,255,.25)",position:"relative",overflow:"hidden" }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"10px 10px 0 0",pointerEvents:"none" }}/>
              📸 Email Receipt Photo
            </a>

            {status==="error"&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:11,color:"#fca5a5",marginBottom:12 }}>Something went wrong. Please email hello@jerseybasket.je</div>}

            <button onClick={handleSubmit} disabled={required||status==="sending"}
              style={{ width:"100%",padding:"13px",background:required||status==="sending"?"rgba(234,88,12,.3)":"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",border:"none",borderRadius:12,color:"#fff",cursor:required?"not-allowed":"pointer",fontSize:14,fontWeight:700,boxShadow:required||status==="sending"?"none":"0 3px 12px rgba(194,65,12,.6),inset 0 1px 0 rgba(255,255,255,.25)",position:"relative",overflow:"hidden" }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"12px 12px 0 0",pointerEvents:"none" }}/>
              {status==="sending" ? "Submitting…" : "Submit Entry →"}
            </button>
            </div>{/* end scrollable body */}
          </>
        )}
      </div>
    </div>
  );
}

function AdBanner({ onEnquiry }) {
  const PAUSE_MS  = 2000;
  const SLIDE_MS  = 620;
  const COUNT     = AD_SLIDES.length;

  const [current,  setCurrent]  = useState(0);
  const [offset,   setOffset]   = useState(0);   // 0..COUNT-1 (fractional during animation)
  const [paused,   setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);

  const currentRef = useRef(0);
  const dirRef     = useRef(1);   // +1 forward, -1 backward
  const timerRef   = useRef(null);
  const rafRef     = useRef(null);
  const pauseRef   = useRef(false);
  const startRef   = useRef(null);
  const animRef    = useRef(null); // rAF for slide animation

  // ── smooth slide to a target index ──────────────────────────────────────
  const slideTo = useCallback((target) => {
    cancelAnimationFrame(animRef.current);
    const from    = currentRef.current;
    const started = performance.now();
    // ease in-out cubic
    const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

    const step = (now) => {
      const t = Math.min((now - started) / SLIDE_MS, 1);
      setOffset(from + (target - from) * ease(t));
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setOffset(target);
        setCurrent(target);
        currentRef.current = target;
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  // ── progress bar tick ────────────────────────────────────────────────────
  const startTick = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    startRef.current = performance.now();
    const tick = (now) => {
      if (pauseRef.current) return;
      const frac = Math.min((now - startRef.current) / PAUSE_MS, 1);
      setProgress(frac);
      if (frac < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── schedule next advance ─────────────────────────────────────────────────
  const schedule = useCallback((after = PAUSE_MS) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (pauseRef.current) return;
      const cur  = currentRef.current;
      let next = cur + dirRef.current;
      if (next >= COUNT) { dirRef.current = -1; next = cur - 1; }
      else if (next < 0) { dirRef.current =  1; next = cur + 1; }
      slideTo(next);
      startTick();
      schedule();
    }, after);
  }, [slideTo, startTick, COUNT]);

  // boot
  useEffect(() => {
    startTick();
    schedule();
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, [schedule, startTick]);
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Page is visible again — clear everything and restart cleanly
        pauseRef.current = false;
        setPaused(false);
        clearTimeout(timerRef.current);
        cancelAnimationFrame(rafRef.current);
        cancelAnimationFrame(animRef.current);
        startTick();
        schedule();
      } else {
        // Page hidden — pause everything to save resources
        clearTimeout(timerRef.current);
        cancelAnimationFrame(rafRef.current);
        cancelAnimationFrame(animRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [startTick, schedule]);

  // hover pause / resume
  const handleEnter = () => {
    pauseRef.current = true;
    setPaused(true);
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
  };
  const handleLeave = () => {
    pauseRef.current = false;
    setPaused(false);
    startTick();
    schedule();
  };

  // dot / swipe jump
  const jumpTo = useCallback((idx) => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    slideTo(idx);
    startTick();
    schedule();
  }, [slideTo, startTick, schedule]);

  // touch swipe + tap-to-pause / second-tap-to-open
  const touchX        = useRef(0);
  const tapPaused     = useRef(false);
  const tapTimer      = useRef(null);
  const mouseDownX    = useRef(0);

  const handleTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) {
      // swipe
      tapPaused.current = false;
      pauseRef.current  = false;
      setPaused(false);
      jumpTo(dx < 0 ? (current+1)%COUNT : (current-1+COUNT)%COUNT);
      return;
    }
    // tap — prevent ghost click
    e.preventDefault();
    const s = AD_SLIDES[currentRef.current];
    if (!s) return;
    if (!tapPaused.current) {
      // FIRST TAP — pause so user can read
      tapPaused.current = true;
      pauseRef.current  = true;
      setPaused(true);
      clearTimeout(tapTimer.current);
      // auto-resume after 4s
      tapTimer.current = setTimeout(() => {
        tapPaused.current = false;
        pauseRef.current  = false;
        setPaused(false);
        schedule(500);
        startTick();
      }, 4000);
    } else {
      // SECOND TAP — open URL
      clearTimeout(tapTimer.current);
      tapPaused.current = false;
      pauseRef.current  = false;
      setPaused(false);
      if (s.link === ENQUIRY_TRIGGER) { onEnquiry(); }
      else { window.open(s.link, "_blank", "noopener,noreferrer"); }
      schedule(500);
      startTick();
    }
  };

  // track translateX: offset=0 → 0%, offset=1 → -100%, etc.
  const trackX = -(offset / COUNT) * 100;

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={e=>{ mouseDownX.current = e.clientX; }}
      onClick={(e)=>{
        // Desktop click only — skip if touch (handled above)
        if(e.detail === 0) return;
        if(Math.abs(e.clientX - mouseDownX.current) > 5) return;
        const s = AD_SLIDES[current];
        if(!s) return;
        if(s.link===ENQUIRY_TRIGGER){ onEnquiry(); }
        else { window.open(s.link,"_blank","noopener,noreferrer"); }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position:"relative",
        height:"auto", minHeight:72, maxHeight:130,
        paddingBottom:"env(safe-area-inset-bottom,0px)",
        paddingLeft:"env(safe-area-inset-left,0px)",
        paddingRight:"env(safe-area-inset-right,0px)",
        overflow:"hidden",
        boxShadow:"0 -2px 16px rgba(0,0,0,0.35)",
        borderTop:"1px solid rgba(255,255,255,0.06)",
        cursor:"pointer",
      }}
    >
      {/* ── SLIDING TRACK ── all 4 slides sit side-by-side, track translates */}
      <div style={{
        display:"flex",
        width:`${COUNT * 100}%`,
        transform:`translateX(${trackX}%)`,
        transition:"none",   /* animation is driven by rAF, not CSS */
        willChange:"transform",
      }}>
        {AD_SLIDES.map((s) => (
          <div
            key={s.id}
            style={{
              width:`${100/COUNT}%`,
              flexShrink:0,
              position:"relative",
              overflow:"hidden",
              background: s.bg,
              opacity: 0.92,
              display:"block",
              textDecoration:"none",
            }}
          >
            {/* ── per-slide decorations ── */}
            {s.grid && (
              <div style={{ position:"absolute",inset:0,opacity:0.04,pointerEvents:"none",
                backgroundImage:"linear-gradient(#f59e0b 1px,transparent 1px),linear-gradient(90deg,#f59e0b 1px,transparent 1px)",
                backgroundSize:"40px 40px" }} />
            )}
            {s.deco && (
              <>
                <div style={{ position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(74,222,128,0.07)",right:-50,top:-70,pointerEvents:"none" }} />
                <div style={{ position:"absolute",width:140,height:140,borderRadius:"50%",background:"rgba(74,222,128,0.07)",right:90,bottom:-45,pointerEvents:"none" }} />
              </>
            )}
            {s.cross && (
              <div style={{ position:"absolute",right:0,top:0,bottom:0,width:160,opacity:0.07,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
                <div style={{ position:"relative",width:100,height:100 }}>
                  <div style={{ position:"absolute",top:"50%",left:0,right:0,height:30,background:"white",transform:"translateY(-50%)",borderRadius:4 }} />
                  <div style={{ position:"absolute",left:"50%",top:0,bottom:0,width:30,background:"white",transform:"translateX(-50%)",borderRadius:4 }} />
                </div>
              </div>
            )}
            {s.accent      && <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:s.accent,pointerEvents:"none" }} />}
            {s.accentBottom && <div style={{ position:"absolute",bottom:2,left:0,right:0,height:3,background:s.accentBottom,pointerEvents:"none" }} />}

            {/* ── CONTENT ── responsive: mobile stacks sub below eyebrow, desktop enlarges */}
            <div style={{
              position:"relative", zIndex:2,
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"clamp(10px,1.5vh,18px) clamp(10px,3vw,32px)",
              gap:"clamp(6px,2vw,20px)",
              maxWidth:1200, margin:"0 auto", boxSizing:"border-box",
              width:"100%",
            }}>
              {/* LEFT */}
              <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1.5vw,16px)", minWidth:0, flex:1, flexWrap: s.sub && s.sub.wrap ? "wrap" : "nowrap" }}>
                {s.logo && <img src={s.logo} alt="advertiser logo" style={{ height:"clamp(32px,5.5vw,70px)", width:"auto", maxHeight:70, borderRadius:6, flexShrink:0, objectFit:"contain" }} />}
                {/* Eyebrow + headline row */}
                <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1.2vw,14px)", flexShrink:0, ...(s.sub && s.sub.wrap ? { flexBasis:"auto" } : {}) }}>
                  <div style={{ fontFamily:"'DM Sans',Arial,sans-serif", fontSize:"clamp(8px,1.4vw,13px)", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:s.eyebrow.color, borderLeft:`2px solid ${s.eyebrow.color}`, paddingLeft:6, lineHeight:1, whiteSpace:"nowrap", flexShrink:0 }}>
                    {s.eyebrow.text}
                  </div>
                  <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(13px,2.8vw,30px)", lineHeight:1.2, letterSpacing:"-0.3px", color:s.headline.headlineColor||"#f0f4f8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {s.headline.before}
                    <span style={{
                      color: s.headline.highlightGold||s.headline.highlightGreen ? "transparent" : s.headline.highlightColor,
                      fontStyle:"italic",
                      textDecoration: s.headline.highlightUnderline ? "underline" : "none",
                      textUnderlineOffset:3, textDecorationThickness:1.5,
                      ...(s.headline.highlightGold  ? { background:"linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)", WebkitBackgroundClip:"text", backgroundClip:"text" } : {}),
                      ...(s.headline.highlightGreen ? { background:"linear-gradient(135deg,#16a34a,#22c55e)",        WebkitBackgroundClip:"text", backgroundClip:"text" } : {}),
                    }}>{s.headline.highlight}</span>
                    {s.headline.after}
                  </div>
                </div>
                {/* Sub text — full-width centred row when wrap:true */}
                {s.sub && s.sub.text && (
                  <div style={{ fontFamily:"'DM Sans',Arial,sans-serif", fontSize:"clamp(9px,1.3vw,15px)", color:s.sub.color, opacity:0.85, fontWeight:700, textDecoration:"underline", textDecorationThickness:1.5, textUnderlineOffset:2,
                    ...(s.sub.wrap ? {
                      flexBasis:"100%",
                      textAlign:"center",
                      padding:"2px clamp(8px,2vw,16px) 0",
                      whiteSpace:"normal",
                      lineHeight:1.3,
                      overflow:"hidden",
                      display:"-webkit-box",
                      WebkitLineClamp:2,
                      WebkitBoxOrient:"vertical",
                    } : {
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                    })
                  }}>
                    {s.sub.text}
                  </div>
                )}
              </div>

              {/* RIGHT — CTA */}
              <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1.2vw,14px)", flexShrink:0 }}>
                <div style={{ fontFamily:"'DM Sans',Arial,sans-serif", fontSize:"clamp(10px,1.3vw,15px)", color:s.cta.labelColor, fontWeight:600, whiteSpace:"nowrap", opacity:0.9 }}>
                  {s.cta.label}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1vw,11px)", borderRadius:8, padding:"clamp(5px,1vh,9px) clamp(9px,1.2vw,16px)", background:s.cta.boxBg, border:`1px solid ${s.cta.boxBorder}` }}>
                  <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(11px,1.7vw,19px)", color:s.cta.urlColor, whiteSpace:"nowrap", fontWeight:400 }}>
                    {s.cta.url}
                  </div>
                  <div style={{ width:"clamp(20px,2.8vw,34px)", height:"clamp(20px,2.8vw,34px)", borderRadius:"50%", background:s.cta.arrowBg, color:s.cta.arrowColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(11px,1.5vw,17px)", fontWeight:700, flexShrink:0 }}>→</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── progress bar ── */}
      <div style={{ position:"absolute",bottom:0,left:0,width:`${progress*100}%`,height:1.5,background:"rgba(255,255,255,0.35)",zIndex:10,pointerEvents:"none" }} />

      {/* ── dot indicators ── */}
      <div style={{ position:"absolute",bottom:5,right:"clamp(10px,2vw,20px)",display:"flex",gap:4,zIndex:10 }}>
        {AD_SLIDES.map((_,i) => (
          <div key={i} onClick={()=>jumpTo(i)}
            style={{ width:i===current?10:4,height:4,borderRadius:i===current?2:50,
              background:i===current?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.25)",
              cursor:"pointer",transition:"all 0.3s" }} />
        ))}
      </div>

      {/* ── paused hint ── */}
      {paused && (
        <div style={{ position:"absolute",top:5,right:"clamp(10px,2vw,20px)",fontFamily:"'DM Sans',Arial",fontSize:"9px",letterSpacing:"1px",textTransform:"uppercase",color:"rgba(255,255,255,0.55)",zIndex:10,display:"flex",alignItems:"center",gap:4 }}>
          <span style={{ opacity:0.6 }}>⏸</span>
          <span className="mobile-tap-hint" style={{ display:"none" }}>tap again to visit →</span>
        </div>
      )}
      <style>{`.mobile-tap-hint { display:none !important; } @media (pointer:coarse) { .mobile-tap-hint { display:inline !important; } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BASKET ITEM — swipe to delete on mobile, ✕ button on desktop, tick off
═══════════════════════════════════════════════════════════════════════════ */
function BasketItem({ item, overPay, onRemove, onAdd, onDelete }) {
  const [ticked,     setTicked]     = useState(false);
  const [swipeX,     setSwipeX]     = useState(0);
  const [swiping,    setSwiping]    = useState(false);
  const [deleted,    setDeleted]    = useState(false);
  const startX = useRef(0);
  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e) => {
    const dx = e.touches[0].clientX - startX.current;
    // Only allow left swipe (negative dx)
    if (dx < 0) setSwipeX(Math.max(dx, -120));
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (swipeX < -SWIPE_THRESHOLD) {
      // Trigger delete animation
      setDeleted(true);
      setTimeout(onDelete, 300);
    } else {
      setSwipeX(0);
    }
  };

  if (deleted) return null;

  return (
    <div style={{ position:"relative", overflow:"hidden", borderRadius:12 }}>
      {/* Red delete background revealed on swipe */}
      <div style={{
        position:"absolute", right:0, top:0, bottom:0, width:120,
        background:"linear-gradient(135deg,#dc2626,#b91c1c)",
        display:"flex", alignItems:"center", justifyContent:"center",
        borderRadius:12, gap:6,
      }}>
        <span style={{ fontSize:22 }}>🗑️</span>
      </div>

      {/* Main item row */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background: ticked ? "#0d2818" : "#0f172a",
          borderRadius:12, padding:"9px 13px",
          border: ticked ? "1px solid rgba(34,197,94,.2)" : "1px solid rgba(255,255,255,.07)",
          transform:`translateX(${swipeX}px)`,
          transition: swiping ? "none" : "transform .3s ease, background .2s, border .2s, opacity .3s",
          opacity: deleted ? 0 : 1,
          position:"relative", zIndex:1,
          userSelect:"none",
        }}
      >
        {/* Tick off button */}
        <button
          onClick={()=>setTicked(t=>!t)}
          title={ticked ? "Mark as not collected" : "Mark as collected"}
          style={{
            flexShrink:0, width:24, height:24, borderRadius:6,
            background: ticked ? "#16a34a" : "rgba(255,255,255,.08)",
            border: ticked ? "none" : "1px solid rgba(255,255,255,.15)",
            color:"white", cursor:"pointer", fontSize:12, fontWeight:700,
            display:"flex", alignItems:"center", justifyContent:"center",
            marginRight:8, transition:"all .2s",
          }}>
          {ticked ? "✓" : ""}
        </button>

        {/* Product info */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <span style={{ fontSize:18, flexShrink:0, opacity: ticked ? 0.4 : 1, transition:"opacity .2s" }}>{item.product.icon}</span>
          <div style={{ minWidth:0 }}>
            <Tooltip text={item.product.name}>
              <div style={{ fontSize:11.5, fontWeight:600, color: ticked ? "#475569" : "#f0f4f8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration: ticked ? "line-through" : "none", transition:"all .2s" }}>
                {item.product.name}
              </div>
            </Tooltip>
            <div style={{ fontSize:9.5, color:"#475569" }}>
              {item.store?.emoji} {item.store?.name} · £{item.price.toFixed(2)}
              {overPay>0.01&&<span style={{ color:"#f87171", marginLeft:4 }}>(+£{overPay.toFixed(2)} vs cheapest)</span>}
            </div>
          </div>
        </div>

        {/* Quantity controls + price + delete */}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4, flexShrink:0 }}>
          <span style={{ fontSize:12.5, fontWeight:700, color: ticked ? "#475569" : "#f0f4f8", textDecoration: ticked ? "line-through" : "none" }}>
            £{(item.price*item.qty).toFixed(2)}
          </span>
          <div style={{ display:"flex", alignItems:"flex-start", gap:5 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.06)", borderRadius:8, padding:"3px 7px" }}>
              <button onClick={onRemove} style={{ background:"rgba(255,255,255,.9)", border:"none", borderRadius:5, width:20, height:20, color:"#dc2626", cursor:"pointer", fontSize:14, fontWeight:700, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
              <span style={{ fontSize:12, fontWeight:700, minWidth:16, textAlign:"center", color:"#f0f4f8" }}>{item.qty}</span>
              <button onClick={onAdd} style={{ background:"rgba(255,255,255,.9)", border:"none", borderRadius:5, width:20, height:20, color:"#16a34a", cursor:"pointer", fontSize:14, fontWeight:700, lineHeight:1, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
            </div>
            {/* ✕ delete button */}
            <button
              onClick={()=>{ setDeleted(true); setTimeout(onDelete, 300); }}
              title="Remove item"
              style={{ background:"rgba(255,255,255,.9)", border:"1px solid rgba(239,68,68,.3)", borderRadius:6, width:22, height:22, color:"#dc2626", cursor:"pointer", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s", flexShrink:0 }}
              onMouseEnter={e=>{ e.currentTarget.style.background="rgba(255,255,255,1)"; e.currentTarget.style.borderColor="rgba(239,68,68,.7)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,.9)"; e.currentTarget.style.borderColor="rgba(239,68,68,.3)"; }}
            >✕</button>
          </div>
        </div>
      </div>

      {/* Swipe hint — only shows briefly on first render on mobile */}
      {swipeX < -10 && (
        <div style={{ position:"absolute", bottom:4, right:10, fontSize:9, color:"rgba(255,255,255,.3)" }}>
          Keep swiping to remove
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, color, children }) {
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  };
  const {r,g,b} = hexToRgb(color);
  const light = `rgb(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)})`;
  const dark  = `rgb(${Math.round(r*0.55)},${Math.round(g*0.55)},${Math.round(b*0.55)})`;
  const dim   = `rgb(${Math.round(r*0.25)},${Math.round(g*0.25)},${Math.round(b*0.25)})`;
  return (
    <button onClick={onClick} style={{
      whiteSpace:"nowrap", padding:"6px 13px", borderRadius:22, fontSize:11, fontWeight:700, cursor:"pointer",
      background: active
        ? `linear-gradient(180deg,${light} 0%,${dark} 100%)`
        : `linear-gradient(180deg,${dark} 0%,${dim} 100%)`,
      border: `1px solid rgba(${r},${g},${b},${active?0.7:0.35})`,
      color: active ? "#fff" : `rgba(${r+80},${g+80},${b+80},0.85)`,
      boxShadow: active
        ? `0 3px 10px rgba(${r},${g},${b},0.55), inset 0 1px 0 rgba(255,255,255,0.25)`
        : `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)`,
      textShadow: "0 1px 2px rgba(0,0,0,0.35)",
      position:"relative", overflow:"hidden",
      opacity: active ? 1 : 0.75,
    }}>
      <span style={{ position:"absolute", top:0, left:0, right:0, height:"52%", background:"linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0.04) 100%)", borderRadius:"22px 22px 0 0", pointerEvents:"none" }} />
      {children}
    </button>
  );
}

