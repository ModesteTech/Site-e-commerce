from sqlalchemy import Column, Integer, String
from database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(120), nullable=False)
    description = Column(String(400), nullable=False)
    price = Column(Integer, nullable=False)
    category = Column(String(60), nullable=False, index=True)
    image_url = Column(String(300), nullable=False)