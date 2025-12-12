import styled from '@emotion/styled';
import { Card } from 'antd';

export const ShopHeader = styled.div<{ bgColor?: string; textColor?: string }>`
  background: ${(props) => props.bgColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  color: ${(props) => props.textColor || '#fff'};
  padding: 80px 50px;
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;

export const BannerImage = styled.div<{ url?: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${(props) => props.url});
  background-size: cover;
  background-position: center;
  opacity: 0.3;
  z-index: 0;
`;

export const ShopContent = styled.div`
  position: relative;
  z-index: 1;
`;

export const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const ShopLogo = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  margin: 0 auto 24px;
  display: block;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ProductCard = styled(Card)`
  height: 100%;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }

  .ant-card-cover {
    height: 250px;
    overflow: hidden;
    background: #f5f5f5;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
`;

export const ProductPrice = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin: 12px 0;
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 100px 0;
`;

export const NoImagePlaceholder = styled.div`
  height: 250px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AboutCard = styled(Card)`
  margin-top: 24px;
`;

export const ShopInfoSection = styled.div`
  margin-top: 24px;
`;

export const ShopInfoContent = styled.div`
  margin-top: 12px;
`;
