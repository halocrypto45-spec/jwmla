/* ==========================================================================
   jwmla — script.js
   Vanilla JS app logic. No frameworks, no page reloads.
   Talks to Firestore/Storage through firebase.js.
   ========================================================================== */

import {
  productsCol,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "./firebase.js";

/* --------------------------------------------------------------------------
   0. ADMIN PASSWORD (client-side gate only, per project spec)
   -------------------------------------------------------------------------- */
const ADMIN_PASSWORD = "1234Halo";

/* --------------------------------------------------------------------------
   1. i18n — EN / KU (Kurdish Sorani) / AR
   -------------------------------------------------------------------------- */
const translations = {
  en: {
    brand: "jwmla",
    all: "All",
    searchPlaceholder: "Search products…",
    heroEyebrow: "The Collection",
    heroSub: "Considered pieces. Honest prices. Delivered with care.",
    heroCta: "Shop the collection",
    marquee1: "NEW ARRIVALS WEEKLY",
    marquee2: "FAST LOCAL DELIVERY",
    marquee3: "CALL OR WHATSAPP US ANYTIME",
    shopTitle: "Shop",
    emptyTitle: "Nothing here yet",
    emptySub: "Products you add will appear on this page.",
    contactEyebrow: "Talk to us",
    callNow: "Call Now",
    whatsapp: "WhatsApp",
    footerNote: "A modern shopping experience, built with care.",
    footerCallLabel: "Call or WhatsApp:",
    addProduct: "+ Add Product",
    new: "New",
    soldOut: "Sold out",
    inStockLabel: "In stock",
    outOfStockLabel: "Out of stock",
    callToOrder: "Call to order",
    edit: "Edit",
    delete: "Delete",
    adminAccess: "Admin access",
    adminAccessSub: "Enter the admin password to continue.",
    password: "Password",
    wrongPassword: "Incorrect password. Try again.",
    confirm: "Confirm",
    productName: "Product name",
    category: "Category",
    categoryPlaceholder: "e.g. Men, Women, Shoes",
    price: "Price (IQD)",
    description: "Description",
    inStock: "In stock",
    markNew: "Mark as New",
    images: "Images",
    imagesHint: "Choose from Camera or Photo Library. First image is the cover photo.",
    cancel: "Cancel",
    saveProduct: "Save Product",
    editProductTitle: "Edit Product",
    confirmDelete: "Delete this product permanently?",
    productSaved: "Product saved",
    productDeleted: "Product deleted",
    productsLoadError: "Couldn't load products. Check your Firebase setup.",
    uploading: "Uploading images…",
    savingProduct: "Saving product…",
    fillRequired: "Please fill in all required fields.",
  },
  ku: {
    brand: "jwmla",
    all: "هەموو",
    searchPlaceholder: "گەڕان بۆ بەرهەم…",
    heroEyebrow: "کۆکراوە",
    heroSub: "بەرهەمی هەڵبژێردراو. نرخی ڕاست. بە ئاگاداری دەگاتە دەست.",
    heroCta: "بینینی کۆکراوەکە",
    marquee1: "بەرهەمی نوێ هەموو هەفتەیەک",
    marquee2: "گەیاندنی خێرا",
    marquee3: "پەیوەندیمان پێوە بکە یان WhatsApp بنێرە",
    shopTitle: "فرۆشگا",
    emptyTitle: "هێشتا هیچ نییە",
    emptySub: "بەرهەمەکانت لێرە دەردەکەون.",
    contactEyebrow: "پەیوەندیمان پێوە بکە",
    callNow: "پەیوەندی بکە",
    whatsapp: "واتساپ",
    footerNote: "ئەزموونێکی مۆدێرنی کڕین، بە ئاگاداری دروستکراوە.",
    footerCallLabel: "پەیوەندی یان واتساپ:",
    addProduct: "+ زیادکردنی بەرهەم",
    new: "نوێ",
    soldOut: "نەماوە",
    inStockLabel: "بەردەستە",
    outOfStockLabel: "بەردەست نییە",
    callToOrder: "پەیوەندی بکە بۆ داواکردن",
    edit: "دەستکاری",
    delete: "سڕینەوە",
    adminAccess: "چوونەژوورەوەی بەڕێوەبەر",
    adminAccessSub: "وشەی نهێنی بنووسە بۆ بەردەوامبوون.",
    password: "وشەی نهێنی",
    wrongPassword: "وشەی نهێنی هەڵەیە. دووبارە هەوڵبدەرەوە.",
    confirm: "پەسەندکردن",
    productName: "ناوی بەرهەم",
    category: "پۆل",
    categoryPlaceholder: "بۆ نموونە: پیاوان، ژنان، پێڵاو",
    price: "نرخ (دینار)",
    description: "وردەکاری",
    inStock: "بەردەستە",
    markNew: "وەک نوێ نیشانبکە",
    images: "وێنەکان",
    imagesHint: "لە کامێرا یان کتێبخانەی وێنە هەڵبژێرە. یەکەم وێنە وێنەی سەرەکییە.",
    cancel: "هەڵوەشاندنەوە",
    saveProduct: "پاشەکەوتکردنی بەرهەم",
    editProductTitle: "دەستکاریکردنی بەرهەم",
    confirmDelete: "دڵنیایت لە سڕینەوەی هەمیشەیی ئەم بەرهەمە؟",
    productSaved: "بەرهەم پاشەکەوتکرا",
    productDeleted: "بەرهەم سڕایەوە",
    productsLoadError: "نەتوانرا بەرهەمەکان بار بکرێن. ڕێکخستنی Firebase بپشکنە.",
    uploading: "وێنەکان باردەکرێن…",
    savingProduct: "بەرهەم پاشەکەوت دەکرێت…",
    fillRequired: "تکایە هەموو خانە پێویستەکان پڕبکەرەوە.",
  },
  ar: {
    brand: "jwmla",
    all: "الكل",
    searchPlaceholder: "ابحث عن المنتجات…",
    heroEyebrow: "المجموعة",
    heroSub: "قطع مختارة بعناية. أسعار صادقة. توصيل موثوق.",
    heroCta: "تسوّق المجموعة",
    marquee1: "وصل حديثاً كل أسبوع",
    marquee2: "توصيل سريع",
    marquee3: "اتصل بنا أو راسلنا عبر واتساب",
    shopTitle: "المتجر",
    emptyTitle: "لا يوجد شيء بعد",
    emptySub: "ستظهر المنتجات التي تضيفها هنا.",
    contactEyebrow: "تواصل معنا",
    callNow: "اتصل الآن",
    whatsapp: "واتساب",
    footerNote: "تجربة تسوق عصرية، مصنوعة بعناية.",
    footerCallLabel: "اتصال أو واتساب:",
    addProduct: "+ إضافة منتج",
    new: "جديد",
    soldOut: "نفدت الكمية",
    inStockLabel: "متوفر",
    outOfStockLabel: "غير متوفر",
    callToOrder: "اتصل للطلب",
    edit: "تعديل",
    delete: "حذف",
    adminAccess: "دخول الإدارة",
    adminAccessSub: "أدخل كلمة مرور الإدارة للمتابعة.",
    password: "كلمة المرور",
    wrongPassword: "كلمة مرور خاطئة. حاول مرة أخرى.",
    confirm: "تأكيد",
    productName: "اسم المنتج",
    category: "الفئة",
    categoryPlaceholder: "مثال: رجالي، نسائي، أحذية",
    price: "السعر (دينار)",
    description: "الوصف",
    inStock: "متوفر",
    markNew: "وضع علامة جديد",
    images: "الصور",
    imagesHint: "اختر من الكاميرا أو مكتبة الصور. الصورة الأولى هي صورة الغلاف.",
    cancel: "إلغاء",
    saveProduct: "حفظ المنتج",
    editProductTitle: "تعديل المنتج",
    confirmDelete: "هل تريد حذف هذا المنتج نهائياً؟",
    productSaved: "تم حفظ المنتج",
    productDeleted: "تم حذف المنتج",
    productsLoadError: "تعذّر تحميل المنتجات. تحقق من إعداد Firebase.",
    uploading: "جارٍ رفع الصور…",
    savingProduct: "جارٍ حفظ المنتج…",
    fillRequired: "يرجى تعبئة جميع الحقول المطلوبة.",
  },
};

let currentLang = "en";

function applyTranslations() {
  const dict = translations[currentLang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) el.textContent = dict[key];
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) el.setAttribute("placeholder", dict[key]);
  });
}

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.lang === lang);
  });
  applyTranslations();
  renderProducts(); // re-render so dynamic text (availability, badges) updates too
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

/* --------------------------------------------------------------------------
   2. Header interactions: search toggle, mobile menu toggle
   -------------------------------------------------------------------------- */
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
const searchInput = document.getElementById("searchInput");

searchToggle.addEventListener("click", () => {
  searchBar.classList.toggle("open");
  if (searchBar.classList.contains("open")) searchInput.focus();
});

const menuToggle = document.getElementById("menuToggle");
const categoryNav = document.getElementById("categoryNav");
menuToggle.addEventListener("click", () => {
  const isOpen = categoryNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value.trim().toLowerCase();
  renderProducts();
});

/* --------------------------------------------------------------------------
   3. Hero letter reveal animation
   -------------------------------------------------------------------------- */
(function animateHero() {
  const el = document.querySelector(".reveal-letters");
  const text = el.getAttribute("data-text");
  el.innerHTML = "";
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch;
    span.style.animationDelay = `${0.15 + i * 0.06}s`;
    el.appendChild(span);
  });
})();

/* --------------------------------------------------------------------------
   4. Product state + Firestore live subscription
   -------------------------------------------------------------------------- */
let allProducts = [];
let currentCategory = "all";
let currentSearch = "";

const productGrid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const productCount = document.getElementById("productCount");
const categoryTrack = document.getElementById("categoryTrack");

const productsQuery = query(productsCol, orderBy("createdAt", "desc"));

onSnapshot(
  productsQuery,
  (snapshot) => {
    allProducts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    buildCategoryChips();
    renderProducts();
  },
  (error) => {
    console.error("Firestore subscription error:", error);
    productGrid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.querySelector("p").textContent = translations[currentLang].productsLoadError;
  }
);

function buildCategoryChips() {
  const categories = [...new Set(allProducts.map((p) => p.category).filter(Boolean))].sort();
  // Keep the "All" chip, rebuild the rest
  categoryTrack.querySelectorAll(".chip:not([data-category='all'])").forEach((c) => c.remove());
  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.dataset.category = cat;
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      currentCategory = cat;
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      renderProducts();
    });
    categoryTrack.appendChild(chip);
  });

  // Also refresh the <datalist> used in the add/edit form
  const categoryList = document.getElementById("categoryList");
  categoryList.innerHTML = "";
  categories.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    categoryList.appendChild(opt);
  });
}

document.querySelector('[data-category="all"]').addEventListener("click", (e) => {
  currentCategory = "all";
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  e.target.classList.add("active");
  renderProducts();
});

function isRecentlyAdded(product) {
  if (!product.createdAt || !product.createdAt.toDate) return false;
  const days = (Date.now() - product.createdAt.toDate().getTime()) / (1000 * 60 * 60 * 24);
  return days <= 14;
}

function renderProducts() {
  const dict = translations[currentLang];

  const filtered = allProducts.filter((p) => {
    const matchesCategory = currentCategory === "all" || p.category === currentCategory;
    const haystack = `${p.name || ""} ${p.description || ""} ${p.category || ""}`.toLowerCase();
    const matchesSearch = !currentSearch || haystack.includes(currentSearch);
    return matchesCategory && matchesSearch;
  });

  productCount.textContent = `${filtered.length} ${filtered.length === 1 ? "item" : "items"}`;

  if (filtered.length === 0) {
    productGrid.innerHTML = "";
    emptyState.hidden = false;
    emptyState.querySelector("p").textContent = dict.emptyTitle;
    emptyState.querySelector("span").textContent = dict.emptySub;
    return;
  }
  emptyState.hidden = true;

  productGrid.innerHTML = "";
  filtered.forEach((p, index) => {
    productGrid.appendChild(buildProductCard(p, dict, index));
  });
}

function buildProductCard(p, dict, index) {
  const images = Array.isArray(p.images) && p.images.length ? p.images : ["https://placehold.co/600x800?text=jwmla"];
  const inStock = p.availability !== false; // default true
  const showNew = p.isNew || isRecentlyAdded(p);

  const card = document.createElement("article");
  card.className = "product-card";
  card.style.animationDelay = `${Math.min(index, 10) * 0.04}s`;

  card.innerHTML = `
    <div class="pc-image-wrap">
      <img class="pc-image" src="${images[0]}" alt="${escapeHtml(p.name || "")}" loading="lazy" />
      <img class="pc-image-alt" src="${images[1] || images[0]}" alt="" loading="lazy" />
      ${showNew ? `<span class="badge badge-new">${dict.new}</span>` : ""}
      ${!inStock ? `<span class="badge badge-sold">${dict.soldOut}</span>` : ""}
    </div>
    <div class="pc-body">
      <p class="pc-category">${escapeHtml(p.category || "")}</p>
      <h3 class="pc-name">${escapeHtml(p.name || "")}</h3>
      <div class="pc-footer">
        <span class="pc-price">${formatPrice(p.price)}</span>
        <span class="pc-availability"><span class="dot ${inStock ? "" : "out"}"></span>${inStock ? dict.inStockLabel : dict.outOfStockLabel}</span>
      </div>
      <div class="pc-admin-row">
        <button class="edit-btn" data-id="${p.id}">${dict.edit}</button>
        <button class="del del-btn" data-id="${p.id}">${dict.delete}</button>
      </div>
    </div>
  `;

  card.querySelector(".pc-image-wrap").addEventListener("click", () => openProductModal(p));
  card.querySelector(".pc-name").addEventListener("click", () => openProductModal(p));

  card.querySelector(".edit-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    requestAdminAccess(() => openEditModal(p));
  });
  card.querySelector(".del-btn").addEventListener("click", (e) => {
    e.stopPropagation();
    requestAdminAccess(() => deleteProduct(p));
  });

  return card;
}

function formatPrice(price) {
  const n = Number(price) || 0;
  return `${n.toLocaleString()} IQD`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* --------------------------------------------------------------------------
   5. Product detail modal
   -------------------------------------------------------------------------- */
const productModalOverlay = document.getElementById("productModalOverlay");
const pmMainImage = document.getElementById("pmMainImage");
const pmThumbs = document.getElementById("pmThumbs");
const pmCategory = document.getElementById("pmCategory");
const pmName = document.getElementById("pmName");
const pmPrice = document.getElementById("pmPrice");
const pmAvailability = document.getElementById("pmAvailability");
const pmDescription = document.getElementById("pmDescription");
const pmNewBadge = document.getElementById("pmNewBadge");
const pmSoldBadge = document.getElementById("pmSoldBadge");
const pmEditBtn = document.getElementById("pmEditBtn");
const pmDeleteBtn = document.getElementById("pmDeleteBtn");

let activeProduct = null;

function openProductModal(p) {
  activeProduct = p;
  const dict = translations[currentLang];
  const images = Array.isArray(p.images) && p.images.length ? p.images : ["https://placehold.co/600x800?text=jwmla"];
  const inStock = p.availability !== false;
  const showNew = p.isNew || isRecentlyAdded(p);

  pmMainImage.src = images[0];
  pmMainImage.alt = p.name || "";
  pmCategory.textContent = p.category || "";
  pmName.textContent = p.name || "";
  pmPrice.textContent = formatPrice(p.price);
  pmDescription.textContent = p.description || "";
  pmAvailability.innerHTML = `<span class="dot ${inStock ? "" : "out"}"></span> ${inStock ? dict.inStockLabel : dict.outOfStockLabel}`;
  pmNewBadge.hidden = !showNew;
  pmSoldBadge.hidden = inStock;

  pmThumbs.innerHTML = "";
  images.forEach((src, i) => {
    const img = document.createElement("img");
    img.src = src;
    img.className = i === 0 ? "active" : "";
    img.addEventListener("click", () => {
      pmMainImage.src = src;
      pmThumbs.querySelectorAll("img").forEach((t) => t.classList.remove("active"));
      img.classList.add("active");
    });
    pmThumbs.appendChild(img);
  });

  productModalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeProductModal() {
  productModalOverlay.hidden = true;
  document.body.style.overflow = "";
  activeProduct = null;
}

document.getElementById("productModalClose").addEventListener("click", closeProductModal);
productModalOverlay.addEventListener("click", (e) => {
  if (e.target === productModalOverlay) closeProductModal();
});

pmEditBtn.addEventListener("click", () => {
  const p = activeProduct;
  requestAdminAccess(() => {
    closeProductModal();
    openEditModal(p);
  });
});
pmDeleteBtn.addEventListener("click", () => {
  const p = activeProduct;
  requestAdminAccess(() => {
    closeProductModal();
    deleteProduct(p);
  });
});

/* --------------------------------------------------------------------------
   6. Admin password gate
   -------------------------------------------------------------------------- */
const passwordModalOverlay = document.getElementById("passwordModalOverlay");
const passwordForm = document.getElementById("passwordForm");
const passwordInput = document.getElementById("passwordInput");
const passwordError = document.getElementById("passwordError");

let pendingAction = null;

function requestAdminAccess(onSuccess) {
  pendingAction = onSuccess;
  passwordInput.value = "";
  passwordError.hidden = true;
  passwordModalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
  setTimeout(() => passwordInput.focus(), 100);
}

function closePasswordModal() {
  passwordModalOverlay.hidden = true;
  document.body.style.overflow = "";
  pendingAction = null;
}

document.getElementById("passwordModalClose").addEventListener("click", closePasswordModal);
passwordModalOverlay.addEventListener("click", (e) => {
  if (e.target === passwordModalOverlay) closePasswordModal();
});

passwordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (passwordInput.value === ADMIN_PASSWORD) {
    const action = pendingAction;
    passwordModalOverlay.hidden = true;
    document.body.style.overflow = "";
    pendingAction = null;
    if (action) action();
  } else {
    passwordError.hidden = false;
    passwordInput.value = "";
    passwordInput.focus();
  }
});

document.getElementById("adminEntryBtn").addEventListener("click", () => {
  requestAdminAccess(() => openEditModal(null));
});

/* --------------------------------------------------------------------------
   7. Add / Edit product modal + image handling
   -------------------------------------------------------------------------- */
const editModalOverlay = document.getElementById("editModalOverlay");
const editTitle = document.getElementById("editTitle");
const productForm = document.getElementById("productForm");
const productIdField = document.getElementById("productId");
const fieldName = document.getElementById("fieldName");
const fieldCategory = document.getElementById("fieldCategory");
const fieldPrice = document.getElementById("fieldPrice");
const fieldDescription = document.getElementById("fieldDescription");
const fieldAvailability = document.getElementById("fieldAvailability");
const fieldIsNew = document.getElementById("fieldIsNew");
const fieldImages = document.getElementById("fieldImages");
const imagePreviewGrid = document.getElementById("imagePreviewGrid");
const formStatus = document.getElementById("formStatus");
const saveProductBtn = document.getElementById("saveProductBtn");

// pendingImages holds { file, url } for new uploads, or { existingUrl } for images already saved
let pendingImages = [];

function openEditModal(product) {
  const dict = translations[currentLang];
  productForm.reset();
  pendingImages = [];
  formStatus.textContent = "";
  formStatus.className = "form-status";

  if (product) {
    editTitle.textContent = dict.editProductTitle;
    productIdField.value = product.id;
    fieldName.value = product.name || "";
    fieldCategory.value = product.category || "";
    fieldPrice.value = product.price || "";
    fieldDescription.value = product.description || "";
    fieldAvailability.checked = product.availability !== false;
    fieldIsNew.checked = !!product.isNew;
    (product.images || []).forEach((url) => pendingImages.push({ existingUrl: url }));
  } else {
    editTitle.textContent = dict.addProduct;
    productIdField.value = "";
    fieldAvailability.checked = true;
    fieldIsNew.checked = false;
  }

  renderImagePreviews();
  editModalOverlay.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeEditModal() {
  editModalOverlay.hidden = true;
  document.body.style.overflow = "";
  pendingImages = [];
}

document.getElementById("editModalClose").addEventListener("click", closeEditModal);
document.getElementById("cancelEditBtn").addEventListener("click", closeEditModal);
editModalOverlay.addEventListener("click", (e) => {
  if (e.target === editModalOverlay) closeEditModal();
});

// New images picked from camera or photo library
fieldImages.addEventListener("change", () => {
  const files = Array.from(fieldImages.files || []);
  files.forEach((file) => {
    pendingImages.push({ file, previewUrl: URL.createObjectURL(file) });
  });
  fieldImages.value = ""; // allow re-selecting the same file later
  renderImagePreviews();
});

function renderImagePreviews() {
  imagePreviewGrid.innerHTML = "";
  pendingImages.forEach((img, i) => {
    const src = img.previewUrl || img.existingUrl;
    const item = document.createElement("div");
    item.className = "image-preview-item";
    item.innerHTML = `
      <img src="${src}" alt="Preview ${i + 1}" />
      ${i === 0 ? `<span class="cover-tag">COVER</span>` : ""}
      <button type="button" class="remove-img" aria-label="Remove image">&times;</button>
    `;
    item.querySelector(".remove-img").addEventListener("click", () => {
      pendingImages.splice(i, 1);
      renderImagePreviews();
    });
    imagePreviewGrid.appendChild(item);
  });
}

productForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dict = translations[currentLang];

  if (!fieldName.value.trim() || !fieldCategory.value.trim() || !fieldPrice.value || !fieldDescription.value.trim()) {
    formStatus.textContent = dict.fillRequired;
    formStatus.className = "form-status error";
    return;
  }

  saveProductBtn.disabled = true;
  formStatus.className = "form-status";

  try {
    // 1. Upload any new image files to Firebase Storage
    const finalImageUrls = [];
    for (let i = 0; i < pendingImages.length; i++) {
      const img = pendingImages[i];
      if (img.existingUrl) {
        finalImageUrls.push(img.existingUrl);
      } else if (img.file) {
        formStatus.textContent = `${dict.uploading} (${i + 1}/${pendingImages.length})`;
        const path = `products/${Date.now()}_${i}_${img.file.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, img.file);
        const url = await getDownloadURL(storageRef);
        finalImageUrls.push(url);
      }
    }

    formStatus.textContent = dict.savingProduct;

    const productData = {
      name: fieldName.value.trim(),
      category: fieldCategory.value.trim(),
      price: Number(fieldPrice.value),
      description: fieldDescription.value.trim(),
      availability: fieldAvailability.checked,
      isNew: fieldIsNew.checked,
      images: finalImageUrls,
    };

    const existingId = productIdField.value;
    if (existingId) {
      // Edit: update Firestore instantly, keep original createdAt
      await updateDoc(doc(productsCol, existingId), productData);
    } else {
      // Add: new doc, timestamped so it stays permanently until manually deleted
      await addDoc(productsCol, { ...productData, createdAt: serverTimestamp() });
    }

    formStatus.textContent = dict.productSaved;
    formStatus.className = "form-status success";
    showToast(dict.productSaved);
    setTimeout(closeEditModal, 500);
  } catch (err) {
    console.error("Save product failed:", err);
    formStatus.textContent = err.message || "Something went wrong.";
    formStatus.className = "form-status error";
  } finally {
    saveProductBtn.disabled = false;
  }
});

/* --------------------------------------------------------------------------
   8. Delete product (Firestore doc + its images in Storage)
   -------------------------------------------------------------------------- */
async function deleteProduct(product) {
  const dict = translations[currentLang];
  if (!confirm(dict.confirmDelete)) return;

  try {
    await deleteDoc(doc(productsCol, product.id));

    // Best-effort cleanup of stored images; ignore failures (e.g. external URLs)
    (product.images || []).forEach((url) => {
      try {
        const storageRef = ref(storage, url);
        deleteObject(storageRef).catch(() => {});
      } catch (_) {
        /* URL wasn't a Storage ref (e.g. placeholder) — skip */
      }
    });

    showToast(dict.productDeleted);
  } catch (err) {
    console.error("Delete failed:", err);
    showToast(err.message || "Delete failed.");
  }
}

/* --------------------------------------------------------------------------
   9. Toast helper
   -------------------------------------------------------------------------- */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

/* --------------------------------------------------------------------------
   10. Init
   -------------------------------------------------------------------------- */
applyTranslations();
