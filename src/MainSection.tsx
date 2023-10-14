import dotenv from 'dotenv';
import React, { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import NoImagesFound from './components/NoImagesFound/NoImagesFound';
import Noresults from './components/Noresults';
import ShimmerLoading from './components/ShimmerLoading/ShimmerLoading';
import BackToTopButton from './components/menu/BackToTopButton';
import Header from './components/menu/Header';
import ImageCard from './components/menu/ImageCard/ImageCard';
import SelectionMenu from './components/menu/SelectionMenu';
import { links } from './utils/links';

const API_URL = 'https://api.unsplash.com/search/photos';
const Image_count = 28;
dotenv.config();

const MainSection = () => {
  const searchInput = useRef<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [linkInfo, setlinkInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [error, setError] = useState(false);
  const [lastPage, setLastPage] = useState(false);

  const fetchImages = async () => {
    let results = [];
    try {
      setIsLoading(true);
      const data = await fetch(
        `${API_URL}?query=${searchInput.current?.value}&page=${page}&per_page=${Image_count}&client_id=${process.env.REACT_APP_UNSPLASH_API_KEY}`
      );
      const json = await data.json();
      results = json?.results;

      if (results < 28) setLastPage(true);

      setImages(results);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }

    if (results.length == 0 && searchInput.current?.value.length != 0) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const fetchMore = async () => {
    let results = [];
    try {
      setIsLoading(true);
      const data = await fetch(
        `${API_URL}?query=${searchInput.current?.value}&page=${page}&per_page=${Image_count}&client_id=${process.env.REACT_APP_UNSPLASH_API_KEY}`
      );
      const json = await data.json();
      results = json?.results;

      if (results < 28) setLastPage(true);

      setImages(images.concat(results));
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }

    if (results.length == 0 && searchInput.current?.value.length != 0) {
      setError(true);
    } else {
      setError(false);
    }
  };

  const handleClick = (e: any) => {
    e.preventDefault();
    const titleArray = links.map((obj) => obj.title);
    if (titleArray.indexOf(searchInput.current?.value) === -1) {
      setBannerImage(null);
    }
    // images != null ? (
    //   fetchImages()
    // ) : (
    //   <div className='font-bold text-black'>Error</div>
    // );
    fetchImages();
    setPage(1);
    setPage(1);

    updateQueryParams(String(searchInput.current?.value), 1);
  };

  const handleSelection = (selectionIndex: number) => {
    const selectedLink = links[selectionIndex];
    if (selectedLink) {
      searchInput.current.value = selectedLink.title;
      fetchImages();
      setPage(1);
      setBannerImage(selectedLink.url);
      setlinkInfo(selectedLink);
      setSearchPerformed(true);

      updateQueryParams(String(searchInput.current?.value), 1);
    } else {
      setBannerImage(null);
    }
  };

  // const navigationHandler = (page: number) => {
  //   setPage(page);
  //   document.querySelector('#image_1')?.scrollIntoView({
  //     behavior: 'smooth',
  //   });
  // };

  useEffect(() => {
    fetchMore();
  }, [page]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);

    try {
      const s = queryParams.get('search');
      const p =
        Number(queryParams.get('page')) && Number(queryParams.get('page')) > 0
          ? Number(queryParams.get('page'))
          : 1;

      console.log(s, p);

      searchInput.current.value = s;
      setPage(p);

      const titleArray = links.map((obj) => obj.title);
      const index = titleArray.indexOf(String(s));
      if (index === -1) {
        setBannerImage(null);
      } else {
        const selectedLink = links[index];
        setBannerImage(selectedLink.url);
        setlinkInfo(selectedLink);
        setSearchPerformed(true);
      }

      if (s) fetchImages();
    } catch (error) {
      console.log(error);
    }
  }, []);

  const updateQueryParams = (search: string, page: number) => {
    const currentUrl = window.location.href;
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('search', search);
    newParams.set('page', String(page));
    const newUrl = `${currentUrl.split('?')[0]}?${newParams.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  return (
    <div className='dark:bg-black dark:h-screen h-full'>
      <Header />
      <div className='flex flex-col justify-center items-center'>
        <div className='text-violet-500 dark:bg-black text-center font-bold text-5xl py-8 md:text-7xl w-full '>
          Snap Grid
        </div>
      </div>
      <div className='text-center m-0'>
        <form className=' dark:bg-black m-0 py-8' onSubmit={handleClick}>
          <input
            className='md:w-96 sm:w-50 h-15 dark:bg-black dark:text-white border-violet-500 hover:border-violet-500 bg-gray-100 rounded-xl p-2 px-4 border-2 focus:dark:drop-shadow-[0px_0px_16px_rgba(132,92,246,1)]'
            placeholder='Search here ...'
            ref={searchInput}
          />
        </form>
      </div>
      <div className='dark:bg-black m-0'>
        <div className=' dark:bg-black p-5 m-0 mx-auto md:max-w-screen-xl'>
          <SelectionMenu links={links} handleSelection={handleSelection} />
        </div>
      </div>
      {isLoading && !bannerImage && searchPerformed ? (
        <ShimmerLoading />
      ) : (
        <div>
          {bannerImage && (
            <div className='flex justify-between dark:bg-black pr-5 xs:px-5 xs:flex-col-reverse xs:mb-6'>
              <div className='top-10 left-0 p-4 dark:text-white max-w-2xl xs:p-0'>
                <h1 className='top-15 font-bold text-left pt-20 px-20 text-5xl xs:p-0'>
                  {linkInfo?.title}
                </h1>
                <div
                  className='px-20 font-light dark:text-slate-200 pt-5 xs:px-0'
                  dangerouslySetInnerHTML={{ __html: linkInfo?.description }}
                />
              </div>
              <img
                src={bannerImage}
                alt='Banner'
                className='w-3/6 h-90 shadow-md rounded-lg xs:w-full xs:mb-6'
              />
            </div>
          )}

          {error && <Noresults />}
          <InfiniteScroll
            dataLength={images.length}
            next={() => setPage(page + 1)}
            hasMore={lastPage}
            className=' dark:bg-black grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 p-5'
            loader={
              <>
                <div role='status' className='flex justify-between'>
                  <svg
                    aria-hidden='true'
                    className='inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600'
                    viewBox='0 0 100 101'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                      fill='currentColor'
                    />
                    <path
                      d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                      fill='currentFill'
                    />
                  </svg>
                  <span className='sr-only'>Loading...</span>
                </div>
              </>
            }
          >
              {!error &&
                images &&
                images.map((image, index) => {
                  return (
                    <ImageCard
                      key={image?.id}
                      url={image?.urls?.small}
                      download={image?.urls?.full}
                    />
                  );
                })}
          </InfiniteScroll>
        </div>
      )}

      {/* <div className='flex justify-center dark:bg-black py-4 '>
        {page > 1 && (
          <button
            onClick={() => {
              updateQueryParams(searchInput.current?.value, page - 1);
              setPage(page - 1);
            }}
            className=' p-1 px-2 bg-violet-500 text-white w-fit rounded-md'
          >
            Previous
          </button>
        )}
        {page < totalPages && (
          <button
            onClick={() => {
              updateQueryParams(searchInput.current?.value, page + 1);
              setPage(page + 1);
            }}
            className='p-1 px-2 mx-6 bg-violet-500 text-white w-fit rounded-md'
          >
            Next
          </button>
        )}
      </div> */}
      <BackToTopButton />
    </div>
  );
};

export default MainSection;
