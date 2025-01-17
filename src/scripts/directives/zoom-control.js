angular
    .module('imageZoom')
    .directive('zoomControl', ['$rootScope', function ($rootScope) {

        function link(scope, element, attrs, ctrl) {

            var $ = angular.element,
                clip = $(element[0].querySelector('.zoom-control__clip')),
                image = clip.find('img'),
                mark = $(clip[0].querySelector('.mark')),
                origWidth = image[0].naturalWidth,
                origHeight = image[0].naturalHeight,
                markBoundingRect = mark[0].getBoundingClientRect();



            scope.imageSrc = ctrl.getImageUrl();
            scope.imageContainerElem = ctrl.getImageContainerElem();
            scope.imageContainerElemZoomed = scope.imageContainerElem[0].querySelector('.zoom-image-container__clip');


            scope.$on('zoom-imagesrc:changed', function(evt, newSrc) {
                scope.imageSrc = newSrc;
            });

            if (!origWidth || !origHeight) {
                image[0].addEventListener('load', onImageLoaded);
            }

            function onImageLoaded(evt) {
                console.log('loaded', evt.currentTarget);

                origWidth = image[0].naturalWidth;
                origHeight = image[0].naturalHeight;

                ctrl.setOrigDimensions(origWidth, origHeight);

                if(scope.imageContainerElem && scope.imageContainerElem.length > 0) {

                    if(scope.imageContainerElemZoomed) {
                        initMark();
                    } else {
                        scope.$on('zoom-imagecontainer:found', initMark());
                    }

                }
                $rootScope.$broadcast('zoom-image:loaded');


            }

            //scope.level =  isNaN(lvlCandidate) ? 1 : lvlCandidate;
            function initMark() {
                var imageContainerHeight;
                scope.markWidth = scope.imageContainerElemZoomed.clientWidth / origWidth * clip[0].clientWidth;

                //console.log('width', scope.imageContainerElemZoomed.clientWidth, origHeight / origWidth);
                imageContainerHeight = scope.imageContainerElemZoomed.clientWidth * (origHeight/origWidth);

                scope.markHeight = imageContainerHeight / origHeight * clip[0].clientHeight;

                mark.css('height', scope.markHeight + 'px')
                    .css('width', scope.markWidth + 'px');


                //moveMarkRel({x:0.5, y:0.5});
            }

            function onMouseMove(evt) {
                moveMarkRel(calculateOffsetRelative(evt));
            }

            clip.on('mouseenter', function (evt) {
                //console.log('enter');
                moveMarkRel(calculateOffsetRelative(evt));
                clip.on('mousemove', onMouseMove);
            });

            clip.on('mouseleave', function (evt) {
                //console.log('leave');
                clip.off('mousemove', onMouseMove);
            });

            function moveMarkRel(offsetRel) {

                var dx = scope.markWidth,
                    dy = scope.markHeight,
                    x = offsetRel.x * clip[0].clientWidth - dx *.5,
                    y = offsetRel.y * clip[0].clientHeight - dy * .5,
                    verti = clip[0].clientHeight / scope.markHeight, //1.9;
                    hori =  clip[0].clientWidth / scope.markWidth;//2;

                //console.log('x', offsetRel.x, clip[0].clientWidth, dx *.5);
                mark
                    .css('left', x + 'px')
                    .css('top',  y + 'px');

                $rootScope.$broadcast('mark:moved', [{x:offsetRel.x*(1+hori)-(hori *.5), y:offsetRel.y*(1+verti)-(verti *.5)}]);

            }

            function calculateOffsetRelative(mouseEvent) {

                markBoundingRect = markBoundingRect || mouseEvent.currentTarget.getBoundingClientRect();
                //console.log('offseet',  mouseEvent.currentTarget, mouseEvent.clientX, markBoundingRect.left, mouseEvent.currentTarget.clientWidth);
                return {
                    x: (mouseEvent.clientX - markBoundingRect.left) / (mouseEvent.currentTarget.clientWidth),
                    y: (mouseEvent.clientY - markBoundingRect.top) / mouseEvent.currentTarget.clientHeight
                }
            }
        }

        return {
            restrict: 'A',
            require: '^zoom',
            scope: {},
            templateUrl: 'zoom-control.html',
            link: link
        };
    }]);
