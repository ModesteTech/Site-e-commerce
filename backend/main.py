from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine, get_db
from models import Product

Base.metadata.create_all(bind=engine)

app = FastAPI(title="MaBoutique API")

# Autorise le frontend local à communiquer avec l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def seed_products(db: Session) -> None:
    if db.query(Product).count() > 0:
        return
    initial_items = [
        Product(
            title="Casque Audio Sans Fil",
            description="Son clair, autonomie longue durée et confort quotidien.",
            price=25000,
            category="electronique",
            image_url="https://placehold.co/600x400?text=Casque+Audio",
        ),
        Product(
            title="Sac à Dos Urbain",
            description="Résistant à l'eau, compartiment PC et rangements pratiques.",
            price=18500,
            category="mode",
            image_url="https://placehold.co/600x400?text=Sac+Urbain",
        ),
        Product(
            title="Lampe de Bureau LED",
            description="Éclairage doux réglable pour le travail et la lecture.",
            price=12000,
            category="maison",
            image_url="https://placehold.co/600x400?text=Lampe+LED",
        ),
    ]
    db.add_all(initial_items)
    db.commit()


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_products(db)
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/products")
def list_products(
    category: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if category and category != "all":
        query = query.filter(Product.category == category)
    if q:
        pattern = f"%{q.strip()}%"
        query = query.filter(Product.title.ilike(pattern) | Product.description.ilike(pattern))
    return query.all()