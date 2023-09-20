import React, { useState, useEffect } from 'react';
import { Loader } from "./Loader/Loader";
import { LoadMoreBtn } from "./Button/Button";
import { Searchbar } from "./SearchBar/SearchBar";
import { ImageGallery } from "./ImageGallery/ImageGallery";
import { Modal } from "./Modal/Modal";
import { FetchImg } from "./Api/Api";
import { GlobalStyle } from "./GlobalStyle.styled";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const App = () => {
  const [hits, setHits] = useState([]);
  const [setTotal] = useState(0);
  const [totalHits, setTotalHits] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [isToastShown, setIsToastShown] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (searchValue.trim() === '') {
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { hits: newHits, totalHits: newTotalHits, total: newTotal } =
          await FetchImg(searchValue.split('/').pop(), page);
        setHits((prevHits) => [...prevHits, ...newHits]);
        setTotalHits(newTotalHits);
        setTotal(newTotal);

        if (newTotalHits === 0) {
          toast.error(
            'Nothing has defined, Sorry, there are no images matching your search query. Please try again.',
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        } else if (!isToastShown) {
          toast.success(`Hooray! We found ${newTotalHits} images`, {
            position: toast.POSITION.TOP_CENTER,
          });
          setIsToastShown(true);
        }

        if (page > Math.round(newTotalHits / 12)) {
          toast.error(
            "Ups, We're sorry, but you've reached the end of search results.",
            {
              position: toast.POSITION.TOP_CENTER,
            }
          );
        }
      } catch (error) {
        console.error('Error fetching data from API:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchValue, page, isToastShown, setTotal]);

  const onLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const onSearch = (search) => {
    setHits([]);
    setTotalHits(0);
    setPage(1);
    setSearchValue(search);
    setIsToastShown(false);
  };

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setIsModalOpen(true);
  };

  const handleCloseModal = (e) => {
    if (e.target.tagName.toLowerCase() === 'img') {
      return;
    }
    setIsModalOpen(false);
  };

  const appStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gridGap: '16px',
    paddingBottom: '24px',
  };

  return (
    <div style={appStyles}>
      <Searchbar onSearch={onSearch} />

      {searchValue !== '' && searchValue.trim() !== '' && (
        <ImageGallery
          images={hits}
          onImageClick={handleImageClick}
          isModalOpen={isModalOpen}
        />
      )}
      {totalHits !== 0 && page < Math.ceil(totalHits / 12) && (
        <LoadMoreBtn onLoadMore={onLoadMore} />
      )}
      <GlobalStyle />
      {isModalOpen && selectedImage && (
        <Modal selectedImage={selectedImage} onClose={handleCloseModal} />
      )}
      {loading && <Loader></Loader>}
      <ToastContainer
        autoClose={4000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};
